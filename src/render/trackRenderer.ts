import { vec2 } from "gl-matrix";
import { reject } from "lodash";
import { createPathString, createSVGElement, getColorForOccupationStatus, shortenEnd, shortenStart } from ".";
import { isSwitch, TrackSwitch } from "../obj/switch";
import { isTooShortForSegment, Track, trackGetOtherBoundary } from "../obj/track";
import { TrackSegment } from "../obj/trackSegment";
import { joinWith } from "../util/joinWith";
import { requireRenderPosition } from "./svg/switchRenderer";


export type TrackSegmentSVGRender = {
    track: Track,
    element: SVGElement,
    detectionSegment: TrackSegment,
    startPos: vec2,
    endPos: vec2,
}

export function getTrackRenderPath(track: Track): vec2[] {
    const [startBoundary, endBoundary] = track.boundries;

    const startPos = requireRenderPosition(startBoundary);
    const endPos = requireRenderPosition(endBoundary);

    let wayPoints =  [startPos, ...getWaypoints(track), endPos];

    const startsWithSwitch = isSwitch(startBoundary);
    const endsWithSwitch = isSwitch(endBoundary);

    if(startsWithSwitch) {
        wayPoints = shortenStart(wayPoints)
    }

    if(endsWithSwitch) {
        wayPoints = shortenEnd(wayPoints);
    }

    return wayPoints;
}

export function createTrackSegmentRenderer(track: Track, parentElement: SVGElement): TrackSegmentSVGRender[]  {

    // Filter out track segments handled by switchrenderers
    const coreSegments = reject(track.segments.detection, segment => isSwitch(segment.startBoundary) || isSwitch(segment.endBoundary))

    const startsWithSwitch = isSwitch(track.boundries[0]);
    const endsWithSwitch = isSwitch(track.boundries[1]);

    if(startsWithSwitch && endsWithSwitch && isTooShortForSegment(track.length)) {
        return []; // SwitchRenderer takes care of this bit
    }

    if(coreSegments.length > 1) {
        throw new Error("coreSegments >1 unsupported");
    }

    const segment = coreSegments[0];

    let renderPath = getTrackRenderPath(track);

    const renderLines: [vec2, vec2][] = joinWith(renderPath, toTuple);

    return renderLines.map(line => {
        const element = createSVGElement("path");
        element.setAttribute("d", createPathString(renderPath));
        element.setAttribute("fill", "none")
        parentElement.appendChild(element);
        
        return {
            track,
            trackSegment: segment,
            element: element,
            detectionSegment: segment,
            startPos: line[0],
            endPos: line[1],
        }
    });
}

export function updateTrackRender(trackRenderData: TrackSegmentSVGRender, occupiedSegments: TrackSegment[]) {
    // TODO switch offsets
    const {element} = trackRenderData;

    // Set stroke color to train detection status
    element.setAttribute("stroke", getColorForOccupationStatus(occupiedSegments.includes(trackRenderData.detectionSegment)));
}

function getWaypoints(track: Track): vec2[] {
    if(track?.renderData?.waypoints) {
        return track.renderData.waypoints
    } else {
        return []
    }
}
function toTuple<T,U>(a:T, b:U) : [T,U] {
    return [a,b];
}


export function getNearestRenderWaypoint(swi: TrackSwitch,track: Track): vec2 {
    const waypoints = track?.renderData?.waypoints;

    if(!Array.isArray(waypoints) || waypoints.length === 0) {
        return requireRenderPosition(trackGetOtherBoundary(track, swi.id))
    }

    if(waypoints.length > 1) {
        throw new Error("Multiple render waypoints unsupported");
    }

    return waypoints[0];
}

// function findPositionOnLine(lines: [vec2, vec2][], normalizedPosition: number) {
//     const lineLenghts = lines.map(([veca,vecb]) => vec2.distance(veca,vecb))

//     const completeLength = lineLenghts.reduce(add,0);
//     const realOffset = completeLength * normalizedPosition;




// }

// function screenPosForTrackoffset(trackPosition: TrackPosition): vec2 {
//     const track = trackPosition.track;
//     const lines = getLinePositions(trackPosition.track);

//     if(trackPosition.offset === 0) {
//         return lines[0][0];
//     }

//     if(trackPosition.offset === trackPosition.track.length) {
//         const lastLine = last(lines);

//         if(!lastLine) {
//             throw new Error("wtf");
//         }
//         return lastLine[1];
//     }

//     console.log(lines.length)

//     if(lines.length > 1) {
//         console.log(lines);
//     }
    

//     const lineLenghts = lines.map(([veca,vecb]) => vec2.distance(veca,vecb))
//     const lineLength = lineLenghts.reduce(add,0);

//     const normalizedPosition = trackPosition.offset / track.length;    
//     const screenSpaceLineOffset = lineLength * normalizedPosition; // Screenspace offset 

//     const [lineIndex,lineOffset] = getScreenSpaceLineOffset(lineLenghts, screenSpaceLineOffset);

//     const baseLine = lines[lineIndex];
//     const lineMovement = vec2.subtract(vec2.create(), baseLine[1], baseLine[0]);
//     const lineVector = vec2.normalize(lineMovement, lineMovement);

    

//     const screenPos = vec2.add(vec2.create(), baseLine[0], vec2.scale(vec2.create(), lineVector, lineOffset));

//     if(lines.length > 1 ) {
//         console.log(screenPos)
//     }

//     return screenPos
// }

// /**
//  * 
//  * @param linesLenghts 
//  * @param targetPosition 
//  * @returns [lineIndex,lineOffset]
//  */
// function getScreenSpaceLineOffset(linesLenghts: number[], targetPosition: number): [number,number] {
//     let lineStartPos = 0;
//     for (let index = 0; index < linesLenghts.length; index++) {
//         const currentLineLength = linesLenghts[index];
//         if(targetPosition >= lineStartPos && targetPosition <= lineStartPos + currentLineLength) {
//             return [index, lineStartPos+targetPosition]
//         }
//         lineStartPos += currentLineLength;
//     }

//     throw new Error("Targetposition not found")
// }