import { createSVGElement } from ".";
import { HandleSignalClick } from "../../interfaces/eventHandlers";
import { COLOR_UNOCCUPIED } from "../index";
import { SignalSVGRenderer } from "./signalRenderer";

// function createTrackRenderers(tracks: Track[], containingElement: SVGElement): TrackSegmentSVGRender[] {
// return flatten(tracks.map((track: Track, index): TrackSegmentSVGRender[] => {
//         // const [startBoundary, endBoundary] = track.boundries;
//         // if (!startBoundary.renderData || !endBoundary.renderData) {
//         //     throw new Error("Boundary lacks renderData");
//         // }
//         // if (!startBoundary.renderData.position || !endBoundary.renderData.position) {
//         //     throw new Error("Boundary lacks proper renderData");
//         // }
//         // const startPos = startBoundary.renderData.position;
//         // const endPos = endBoundary.renderData.position;
//         const switchOffset: [boolean, boolean] = [
//             !shouldDrawAllTheWay(track, startBoundary),
//             !shouldDrawAllTheWay(track, endBoundary)
//         ];
//         // if(!shouldDrawAllTheWay(track, startBoundary)) {
//         //     vec2.add(startDrawPos,startDrawPos,lineOffset);
//         // }
//         // if(!shouldDrawAllTheWay(track, endBoundary)) {
//         //     vec2.subtract(endDrawPos, endDrawPos, lineOffset);
//         // }
//         const trackDetectionSegments = track.segments.detection;
//         const segments =  trackDetectionSegments.map((trackDetectionSegment) : TrackSegmentSVGRender =>  {
//             const [segmentStart, segmentEnd] = getRenderPositionsForTrackSegment([startPos, endPos], switchOffset, track.length, trackDetectionSegment);
//             const line: SVGLineElement = document.createElementNS("http://www.w3.org/2000/svg", "line");
//             line.setAttribute("x1", "" + segmentStart[0]);
//             line.setAttribute("y1", "" + segmentStart[1]);
//             line.setAttribute("x2", "" + segmentEnd[0]);
//             line.setAttribute("y2", "" + segmentEnd[1]);
//             // line.setAttribute("stroke", getColorForOccupationStatus(isTrackOccupied(track.id, occupiedTrackIds)))
//             // line.setAttribute("stroke", getColorForOccupationStatus(isSectionOccupied(trackDetectionSegment, occupiedSegments)));
//             line.setAttribute("id", "" + index);
//             containingElement.appendChild(line);
//             return {
//                 element: line,
//                 track: track,
//                 trackSegment: trackDetectionSegment
//             }
//         })
//         return segments;
// if(isTrack(ent) && ent.segments.length > 0) {
// track.segments.forEach(segment => {
//     [segment.end,segment.end].forEach(segmentPoint => {
//         const pos = segmentPoint/track.length;
//         const DIVIDER_LENGTH = 8;
//         const basePos = vec2.lerp(vec2.create(),startPos,endPos,pos);
//         const normal = getLineNormal(startPos,endPos);
//         const posA = vec2.scaleAndAdd(vec2.create(),basePos,normal,DIVIDER_LENGTH)
//         const posB = vec2.scaleAndAdd(vec2.create(),basePos,normal,-DIVIDER_LENGTH)
//         const line: SVGElement = document.createElementNS("http://www.w3.org/2000/svg","line");
//         line.setAttribute("x1", ""+ posA[0])
//         line.setAttribute("y1", ""+ posA[1])
//         line.setAttribute("x2", ""+ posB[0])
//         line.setAttribute("y2", ""+ posB[1])
//         line.setAttribute("stroke", COLOR_UNOCCUPIED),
//         line.setAttribute("stroke-width", "1.5"),
//         line.setAttribute("id", "" + index);
//         containingElement.appendChild(line);
//     })
// })
// })
//     )
// }
// function renderTrack(trackRenderer: TrackSegmentSVGRender) {
// }

export function renderSignalInteractables(signal: SignalSVGRenderer[], interactableGroup: SVGGElement, inputHandler?: HandleSignalClick) {
    signal.forEach(signal => {
        const circle = createSVGElement("circle");
        circle.setAttribute("cx", signal.position[0] + "");
        circle.setAttribute("cy", signal.position[1] + "");
        circle.setAttribute("r", "10");
        circle.setAttribute("fill", "none");
        circle.setAttribute("stroke-width", "1");
        circle.setAttribute("stroke", COLOR_UNOCCUPIED);
        circle.setAttribute("pointer-events", "fill");

        circle.addEventListener("click", (e) => {
            inputHandler?.onSignalClickPrimary(signal)
        });

        circle.addEventListener("contextmenu", (e) => {
            e.preventDefault()
            inputHandler?.onSignalClickSecondary(signal)
        });


        interactableGroup.appendChild(circle);
    });
}
