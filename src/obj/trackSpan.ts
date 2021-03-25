import { TrackPosition } from "./situation";
import { TrackSegment } from "./trackSegment";

export type TrackSpan = {
    startPosition: TrackPosition
    segments: TrackSegment[],
    endPosition: TrackPosition
}