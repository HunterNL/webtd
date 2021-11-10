import { sortBy } from "lodash";
import { Identifier } from "../../interfaces/id";
import { doRangesOverlap } from "../../util/rangeOverlap";
import { TrackPosition } from "./situation";
import { TrackBoundary } from "./switch";
import { Track } from "./track";

// type world = "world"
// type hello<T extends String> = `hello ${T}`;

// type aaaa = hello<"derg">;

// type cap<T extends string> = Capitalize<T>;

// type segmentBoundary = {
//     startsAtBoundary: true,
//     boundary: TrackBoundary
// }

// type midpoint = {
//     startsAtBoundary: false,
//     boundary: number
// }

// type SegmentStart = segmentBoundary | midpoint

// type adaddad = NewType<"foo">
// type Boundary<Taa extends string> = NewType;

/***
 * A range within a single piece of track
 */
export type TrackSegment = {
    trackId: Identifier,
    // length: number,
    startBoundary?: TrackBoundary,
    endBoundary?: TrackBoundary,
    start: number,
    end: number,
}
// } & SegmentStart

export function segmentCreate(track: Track, offset1: number, offset2: number) {
    const start = offset1 < offset2 ? offset1 : offset2;
    const end = offset1 > offset2 ? offset1 : offset2;

    return {
        start,
        end,
        trackId: track.id,
        startBoundary: start === 0 ? track.boundries[0] : undefined,
        endBoundary: end === track.length ? track.boundries[1] : undefined
    }
}

export function segmentGetOrdered(segment: TrackSegment): [number,number] {
    if(segment.end > segment.start) {
        return [segment.start,segment.end];
    } else {
        return [segment.end,segment.start]
    }
}

export function doSegmentsOverlap(segmentA: TrackSegment, segmentB: TrackSegment): boolean {
    if(segmentA.trackId !== segmentB.trackId) {
        return false;
    }

    const segmentAOrdered = segmentGetOrdered(segmentA)
    const segmentBOrdered = segmentGetOrdered(segmentB)

    return doRangesOverlap(segmentAOrdered[0], segmentAOrdered[1], segmentBOrdered[0], segmentBOrdered[1]);
}

export function doesSegmentContainSegment(parent: TrackSegment, child: TrackSegment): boolean {
    if(parent.trackId !== child.trackId) {
        return false;
    }

    return child.start >= parent.start && child.end <= parent.end;
}


export function splitRangeAtPoints(range:number, points:number[]) : [number,number][] {
    const sortedPoints = sortBy(points)

    let lastPoint = 0;

    const segments : [number,number][] = sortedPoints.map(point => {
        lastPoint = lastPoint + point
        return [lastPoint-point, point];
    })

    segments.push([lastPoint,range]);

    return segments;
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