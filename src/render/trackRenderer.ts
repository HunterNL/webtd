import { vec2 } from "gl-matrix";
import { createPathString, createSVGElement, getColorForOccupationStatus, shortenEnd, shortenStart, SWITCH_RENDER_RADIUS } from ".";
import { DetectionBlock } from "../obj/detectionBlock";
import { Track, trackGetRenderPath } from "../obj/physical/track";
import { isSwitch, TrackSwitch } from "../obj/physical/switch";
import { TrackSegment } from "../obj/physical/trackSegment";


export type TrackSegmentSVGRender = {
    element: SVGElement,
    detectionSegment: TrackSegment,
}

export type TrackRenderSegment = {

}

// export function trackSegmentRenderPath(trackSegment: TrackSegment): vec2[] {
//     const {startBoundary, endBoundary} = trackSegment;

//     const startPos = requireRenderPosition(startBoundary);
//     const endPos = requireRenderPosition(endBoundary);

//     let wayPoints =  [startPos, ...getWaypoints(trackSegment), endPos];

//     const startsWithSwitch = isSwitch(startBoundary);
//     const endsWithSwitch = isSwitch(endBoundary);

//     if(startsWithSwitch) {
//         wayPoints = shortenStart(wayPoints)
//     }

//     if(endsWithSwitch) {
//         wayPoints = shortenEnd(wayPoints);
//     }

//     return wayPoints;
// }

// export function trackSplitIntoRenderSegtions(track: Track): TrackRenderSection {
//     track.
// }

// export function getTrackRenderPath(track: Track): vec2[] {
//     const [startBoundary, endBoundary] = track.boundries;

//     const startPos = requireRenderPosition(startBoundary);
//     const endPos = requireRenderPosition(endBoundary);

//     let wayPoints =  [startPos, ...getWaypoints(track), endPos];

//     const startsWithSwitch = isSwitch(startBoundary);
//     const endsWithSwitch = isSwitch(endBoundary);

//     if(startsWithSwitch) {
//         wayPoints = shortenStart(wayPoints, SWITCH_RENDER_RADIUS)
//     }

//     if(endsWithSwitch) {
//         wayPoints = shortenEnd(wayPoints, SWITCH_RENDER_RADIUS);
//     }

//     return wayPoints;
// }

// function createPartialRenderPath()

export function pathAddSwitchMargin(track: Track, renderPath: vec2[], margin: number) {
    const startsWithSwitch = isSwitch(track.boundries[0]);
    const endsWithSwitch = isSwitch(track.boundries[1]);

    return shortenPath(renderPath, startsWithSwitch, endsWithSwitch, margin)
}

export function shortenPath(path: vec2[], shortStart: boolean, shortEnd: boolean, margin: number) {

    if(shortStart) {
        path = shortenStart(path, margin)
    }

    if(shortEnd) {
        path = shortenEnd(path, margin)
    }

    return path;
}

export function createBlockRenderer(detectionBlock: DetectionBlock, parentElement: SVGElement): TrackSegmentSVGRender  {
    // const renderLines: [vec2, vec2][] = joinWith(renderPath, toTuple);

    // Filter out track segments handled by switchrenderers
    // const coreSegments = reject(track.segments.detection, segment => isSwitch(segment.startBoundary) || isSwitch(segment.endBoundary))

    let renderPoints = detectionBlock.renderPoints;

    const startOffset = detectionBlock.startsAtSwitch ? SWITCH_RENDER_RADIUS : 1;
    const endOffset = detectionBlock.endsAtSwitch ? SWITCH_RENDER_RADIUS : 1

    renderPoints = shortenStart(renderPoints, startOffset);
    renderPoints = shortenEnd(renderPoints, endOffset)


    const element = createSVGElement("path");
    element.setAttribute("d", createPathString(renderPoints));
    element.setAttribute("fill", "none")
    parentElement.appendChild(element);
    
    return {
        element,
        detectionSegment: detectionBlock.segment,
    }
}

export function updateTrackRender(trackRenderData: TrackSegmentSVGRender, occupiedSegments: TrackSegment[]) {
    // TODO switch offsets
    const {element} = trackRenderData;

    // Set stroke color to train detection status
    element.setAttribute("stroke", getColorForOccupationStatus(occupiedSegments.includes(trackRenderData.detectionSegment)));
}

function toTuple<T,U>(a:T, b:U) : [T,U] {
    return [a,b];
}

export function getNearestRenderWaypoint(swi: TrackSwitch,track: Track): vec2 {
    const renderPath = trackGetRenderPath(track);
    const isStartSwitch = track.boundries[0].id == swi.id;

    const index = isStartSwitch ? 1 : renderPath.length - 2;

    return renderPath[index];
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