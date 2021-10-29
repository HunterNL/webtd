import { Direction, TrackPosition } from "./physical/situation";
import { TrackSegment } from "./physical/trackSegment";

export type TrackSpan = {
    startPosition: TrackPosition
    endPosition: TrackPosition
    segments: TrackSegment[]
    finalDirection: Direction
}