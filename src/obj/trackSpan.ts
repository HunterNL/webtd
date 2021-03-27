import { Direction, TrackPosition } from "./situation";
import { TrackSegment } from "./trackSegment";

export type TrackSpan = {
    startPosition: TrackPosition
    endPosition: TrackPosition
    segments: TrackSegment[]
    finalDirection: Direction
}