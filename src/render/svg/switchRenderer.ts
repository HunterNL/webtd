import { vec2 } from "gl-matrix";
import { COLOR_UNOCCUPIED, createSVGElement, getColorForOccupationStatus } from "..";
import { Entity, getEntityById } from "../../interfaces/entity";
import { DynamicEnvironment } from "../../obj/environment";
import { TrackSwitch, SwitchState, switchGetPathForState, switchGetAjoiningTrackIds, isSwitch, switchGetAjoiningDetectionSegments } from "../../obj/physical/switch";
import { isTooShortForSegment, isTrack, Track, trackGetOtherBoundary } from "../../obj/physical/track";
import { TrackSegment } from "../../obj/physical/trackSegment";
import { getDirection } from "../../util/vec2";
import { getNearestRenderWaypoint } from "../trackRenderer";

const SWITCH_PATH_LENGTH = 10;

export type SwitchSVGRenderer = {
    trackSwitch: TrackSwitch
    junctionRenderPath: Map<SwitchState, string>,
    junctionElement: SVGElement,
    spurElement?: SVGElement,
    detectionSegments: TrackSegment[],
    origPos: vec2,
}

export function requireRenderPosition(obj: any): vec2 {
    if (!obj.renderData) {
        throw new Error("No renderData");
    }

    if (!obj.renderData.position) {
        throw new Error("No renderData position");
    }

    return obj.renderData.position
}


export function getHalfwaypoint(a: vec2, b: vec2): vec2 {
    return vec2.lerp(vec2.create(), a, b, .5);
}


function createSVGPathStringForSwitchPath(swi: TrackSwitch, switchState: SwitchState, entities: Entity[]): string {
    const trackIds = switchGetPathForState(swi, switchState)[0]; // TODO Support multiple paths
    const switchPos = requireRenderPosition(swi);

    const [startPos, endPos] = trackIds.map(trackId => {
        const track = getEntityById(entities, trackId, isTrack);
        return getNearestRenderWaypoint(swi, track)
    }).map(remotePosition => getPositionOnPointCircle(switchPos, remotePosition)) as [vec2, vec2];

    // https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial/Paths
    return "M " + startPos.join(" ") + " L " + switchPos.join(" ") + " L " + endPos.join(" ");
}

export function getPositionOnPointCircle(switchPos: vec2, remotePosition: vec2) {
    const direction = getDirection(switchPos, remotePosition);
    return vec2.scaleAndAdd(vec2.create(), switchPos, direction, SWITCH_PATH_LENGTH)
}

function createSpurElement(trackSwitch: TrackSwitch, ajoiningSpurTracks: Track[]): SVGElement {
    const svgElement = createSVGElement("path");
    const switchPos = requireRenderPosition(trackSwitch);

    const renderPath = ajoiningSpurTracks.map(track => {
        const otherBoundary = trackGetOtherBoundary(track,trackSwitch.id);
        const otherBoundaryPos = requireRenderPosition(otherBoundary);
        const halfwayPoint = getHalfwaypoint(switchPos, otherBoundaryPos);
        const junctionCirclePos = getPositionOnPointCircle(switchPos, otherBoundaryPos)

        return [halfwayPoint,junctionCirclePos] as [vec2,vec2];
    }).map(pos => {
        return "M " + pos[0].join(" ") + " L " + pos[1].join(" ") 
    }).join(" ")



    svgElement.setAttribute("fill", "none");
    svgElement.setAttribute("stroke", COLOR_UNOCCUPIED)
    svgElement.setAttribute("d", renderPath);

    return svgElement;
}

export function createSwitchRenderer(trackSwitch: TrackSwitch, entities: Entity[], parentElement: SVGElement): SwitchSVGRenderer {
    const renderPosition = requireRenderPosition(trackSwitch);

    const svgElement = createSVGElement("path");

    svgElement.setAttribute("fill", "none");
    svgElement.setAttribute("stroke", COLOR_UNOCCUPIED)
    // const remoteBoundaries = switchGetRemoteBoundaries(trackSwitch, entities)
    const ajoiningSpurTracks = switchGetAjoiningTrackIds(trackSwitch)
        .map(trackId => getEntityById(entities, trackId, isTrack))
        .filter(track => {
            const startsWithSwitch = isSwitch(track.boundries[0]);
            const endsWithSwitch = isSwitch(track.boundries[1]);

            return startsWithSwitch && endsWithSwitch && isTooShortForSegment(track.length);
        })
    

    const hasSpurTracks = ajoiningSpurTracks.length > 0;

    const pathMap = new Map<SwitchState, string>();

    pathMap.set(SwitchState.Straight, createSVGPathStringForSwitchPath(trackSwitch, SwitchState.Straight, entities))
    pathMap.set(SwitchState.Side, createSVGPathStringForSwitchPath(trackSwitch, SwitchState.Side, entities))

    let spurElement;

    if(hasSpurTracks) {
        spurElement = createSpurElement(trackSwitch, ajoiningSpurTracks);
        parentElement.appendChild(spurElement);
    }

    parentElement.appendChild(svgElement)

    return {
        detectionSegments: switchGetAjoiningDetectionSegments(trackSwitch, entities.filter(isTrack)),
        junctionElement: svgElement,
        origPos: renderPosition,
        trackSwitch,
        junctionRenderPath: pathMap,
        spurElement
    }
}

export function updateSwitchRenderer(r: SwitchSVGRenderer, dynamicEnvironment: DynamicEnvironment) {
    // If any ajoining segment is occupied...
    const hasOccupiedSegments = r.detectionSegments.some(segment => dynamicEnvironment.occupiedTrackSegments.includes(segment));
    const pathString = r.junctionRenderPath.get(r.trackSwitch.currentState);

    if (!pathString) {
        throw new Error("Pathstring not found");
    }

    const color = getColorForOccupationStatus(hasOccupiedSegments);

    r.junctionElement.setAttribute("d", pathString)
    r.junctionElement.setAttribute("stroke", color);

    if(r.spurElement) {
        r.spurElement.setAttribute("stroke", color);
    }
}