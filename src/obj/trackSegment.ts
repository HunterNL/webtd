import { Identifier } from "../interfaces/id";
import { doRangesOverlap } from "../util/rangeOverlap"

/***
 * A range within a single piece of track
 */
export type TrackSegment = {
    trackId: Identifier
    start: number,
    end: number
}

/**
 * Helper that fixes offset order
 * @param track 
 * @param offset1 
 * @param offset2 
 * @returns 
 */
export function createSegment(trackId: number,offset1: number,offset2: number): TrackSegment {
    const isInversed = offset2 < offset1;
    const min = isInversed ? offset2 : offset1;
    const max = isInversed ? offset1 : offset2;

    return {
        trackId,
        start: min,
        end: max
    }
}


export function doSegmentsOverlap(segmentA: TrackSegment, segmentB: TrackSegment): boolean {
    if(segmentA.trackId !== segmentB.trackId) {
        throw new Error("Trying to compare tracksegments across different tracks");
    }

    return doRangesOverlap(segmentA.start, segmentA.end, segmentB.start, segmentB.end);
}

export function doesSegmentContainSegment(parent: TrackSegment, child: TrackSegment) {
    if(parent.trackId !== child.trackId) {
        throw new Error("Trying to compare tracksegments across different tracks");
    }

    return child.start >= parent.start && child.end <= parent.end;
}