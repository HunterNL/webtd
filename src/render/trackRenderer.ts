import { createSVGElement, getColorForOccupationStatus, getRenderPositionsForTrackSegment } from ".";
import { Track } from "../obj/track";
import { TrackSegment } from "../obj/trackSegment";

export type TrackSegmentSVGRender = {
    track: Track,
    element: SVGElement,
    trackSegment: TrackSegment

}

export function createTrackRenderer(track: Track, trackSegment: TrackSegment, parentElement: SVGElement): TrackSegmentSVGRender  {
    const element = createSVGElement("line");
    

    const switchOffsets : [boolean,boolean] = [false,false]; // TODO switch offsets

    const [segmentStart,segmentEnd] = getRenderPositionsForTrackSegment(track.renderData.position,switchOffsets,track.length,trackSegment)

    element.setAttribute("x1", ""+ segmentStart[0])
    element.setAttribute("y1", ""+ segmentStart[1])
    element.setAttribute("x2", ""+ segmentEnd[0])
    element.setAttribute("y2", ""+ segmentEnd[1])

    parentElement.appendChild(element);

    return {
        track,
        trackSegment,
        element
    }
}

export function updateTrackRender(trackRenderData: TrackSegmentSVGRender, occupiedSegments: TrackSegment[]) {
    // TODO switch offsets
    trackRenderData.element.setAttribute("stroke", getColorForOccupationStatus(occupiedSegments.includes(trackRenderData.trackSegment)));
}