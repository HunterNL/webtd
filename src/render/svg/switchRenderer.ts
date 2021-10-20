import { vec2 } from "gl-matrix";
import { COLOR_UNOCCUPIED, createSVGElement } from "..";
import { Entity, getEntityById } from "../../interfaces/entity";
import { switchGetActivePaths, switchGetPathForState, SwitchState, TrackSwitch } from "../../obj/switch";
import { isTrack } from "../../obj/track";
import { TrackSegment } from "../../obj/trackSegment";
import { getDirection } from "../../util/vec2";
import { getNearestRenderWaypoint } from "../trackRenderer";

const SWITCH_PATH_LENGTH = 10;

export type SwitchSVGRenderer = {
    trackSwitch: TrackSwitch
    element: SVGElement,
    detectionSegments: TrackSegment[],
    origPos: vec2,
    paths: Map<SwitchState, string>,
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



function createSVGPathStringForSwitchPath(swi: TrackSwitch, switchState: SwitchState, entities: Entity[]): string {
    const trackIds = switchGetPathForState(swi, switchState)[0]; // TODO Support multiple paths
    const switchPos = requireRenderPosition(swi);

    const [startPos, endPos] = trackIds.map(trackId => {
        const track = getEntityById(entities,trackId,isTrack);
        return getNearestRenderWaypoint(swi, track)
    }).map(remotePosition => {
        const direction = getDirection(switchPos, remotePosition);
        return vec2.scaleAndAdd(vec2.create(), switchPos, direction, SWITCH_PATH_LENGTH)
    }) as [vec2, vec2];

    // https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial/Paths
    return "M " + startPos.join(" ") + " L " + switchPos.join(" ") + " L " + endPos.join(" ");
}

export function createSwitchRenderer(trackSwitch: TrackSwitch, entities: Entity[], parentElement: SVGElement): SwitchSVGRenderer {
    const renderPosition = requireRenderPosition(trackSwitch);

    const svgElement = createSVGElement("path");

    // svgElement.setAttribute("stroke-width", "10");
    svgElement.setAttribute("fill", "none");
    svgElement.setAttribute("stroke", COLOR_UNOCCUPIED )
    // const remoteBoundaries = switchGetRemoteBoundaries(trackSwitch, entities)
    // const ajoiningTracks = switchGetAjoiningTrackIds(trackSwitch);

    // const remotePositionMap: {
    //     [x: string]: vec2;
    // } = chain(remoteBoundaries).keyBy(getId).mapValues(requireRenderPosition).value();

    const pathMap = new Map<SwitchState, string>();

    pathMap.set(SwitchState.Straight, createSVGPathStringForSwitchPath(trackSwitch, SwitchState.Straight, entities))
    pathMap.set(SwitchState.Side, createSVGPathStringForSwitchPath(trackSwitch, SwitchState.Side, entities))

    parentElement.appendChild(svgElement)

    return {
        detectionSegments: [],
        element: svgElement,
        origPos: renderPosition,
        trackSwitch,
        paths: pathMap
    }
}

export function updateSwitchRenderer(r: SwitchSVGRenderer) {
    //TODO Render actual paths instead of origin to boundary?
    // const activeTrackIds = uniq(flatten(switchGetActivePaths(r.trackSwitch)))
    // const activeTracks = activeTrackIds.map(id => getEntityById(tracks, id, isTrack));

    const switchState = r.trackSwitch.currentState;

    const pathString = r.paths.get(switchState);

    if (!pathString) {
        throw new Error("Pathstring not found");

    }

    r.element.setAttribute("d", pathString)

    switchGetActivePaths(r.trackSwitch);

}