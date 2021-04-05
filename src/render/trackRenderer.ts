import { vec2 } from "gl-matrix";
import { createSVGElement, getColorForOccupationStatus, getRenderPositionsForTrackSegment, shouldDrawAllTheWay } from ".";
import { Track } from "../obj/track";
import { TrackSegment } from "../obj/trackSegment";

export type TrackSegmentSVGRender = {
    track: Track,
    element: SVGElement,
    trackSegment: TrackSegment,
    startPos: vec2,
    endPos: vec2,
    isFirstSegment: boolean,
    isLastSegment: boolean,
}

export function createTrackRenderer(track: Track, trackSegment: TrackSegment, parentElement: SVGElement): TrackSegmentSVGRender  {
    const element = createSVGElement("line");

    const [startBoundary, endBoundary] = track.boundries;

    if (!startBoundary.renderData || !endBoundary.renderData) {
        throw new Error("Boundary lacks renderData");
    }


    if (!startBoundary.renderData.position || !endBoundary.renderData.position) {
        throw new Error("Boundary lacks proper renderData");
    }

    const startPos = startBoundary.renderData.position;
    const endPos = endBoundary.renderData.position;
    

    // const switchOffsets : [boolean,boolean] = [false,false]; // TODO switch offsets

    // const [segmentStart,segmentEnd] = getRenderPositionsForTrackSegment(track.renderData.position,switchOffsets,track.length,trackSegment)

    // element.setAttribute("x1", ""+ segmentStart[0])
    // element.setAttribute("y1", ""+ segmentStart[1])
    // element.setAttribute("x2", ""+ segmentEnd[0])
    // element.setAttribute("y2", ""+ segmentEnd[1])

    parentElement.appendChild(element);

    return {
        track,
        trackSegment,
        element,
        startPos,
        endPos,
        isFirstSegment: trackSegment.start === 0,
        isLastSegment: trackSegment.end === track.length
    }
}

export function updateTrackRender(trackRenderData: TrackSegmentSVGRender, occupiedSegments: TrackSegment[]) {
    // TODO switch offsets
    const {track, element} = trackRenderData;

    const switchOffsets : [boolean,boolean] = [
        !shouldDrawAllTheWay(track, track.boundries[0]),
        !shouldDrawAllTheWay(track, track.boundries[1])
    ];

    const [segmentStart,segmentEnd] = getRenderPositionsForTrackSegment([trackRenderData.startPos,trackRenderData.endPos],switchOffsets,track.length,trackRenderData.trackSegment);

    element.setAttribute("x1", ""+ segmentStart[0])
    element.setAttribute("y1", ""+ segmentStart[1])
    element.setAttribute("x2", ""+ segmentEnd[0])
    element.setAttribute("y2", ""+ segmentEnd[1])

    // Set stroke color to train detection status
    trackRenderData.element.setAttribute("stroke", getColorForOccupationStatus(occupiedSegments.includes(trackRenderData.trackSegment)));
}