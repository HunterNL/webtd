import { Identifier } from "../interfaces/id";
import { doRangesOverlap } from "../util/rangeOverlap";
import { TrackPosition } from "./situation";

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
        return false;
    }

    return doRangesOverlap(segmentA.start, segmentA.end, segmentB.start, segmentB.end);
}

export function doesSegmentContainSegment(parent: TrackSegment, child: TrackSegment): boolean {
    if(parent.trackId !== child.trackId) {
        return false;
    }

    return child.start >= parent.start && child.end <= parent.end;
}

export function splitTrackAtPoints(trackId: number, length: number, points: number[]): TrackSegment[] {
    let lastPoint = 0;

    const segments : TrackSegment[] = points.map(point => {
        const segment: TrackSegment = {
            trackId,
            start: lastPoint,
            end: point
        }

        lastPoint = point;

        return segment;
    })

    segments.push({
        trackId,
        start: lastPoint,
        end: length
    })

    return segments;

}

export function segmentContainsPosition(segment: TrackSegment, position: TrackPosition): boolean {
    if(segment.trackId !== position.track.id) {
        return false
    }

    return ((position.offset >= segment.start) && (position.offset <= segment.end));
}