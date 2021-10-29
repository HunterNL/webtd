import { vec2 } from "gl-matrix";
import { TrackSegment } from "./physical/trackSegment";

export type DetectionBlock = {
    segment: TrackSegment,
    renderPoints: vec2[],
    startsAtSwitch: boolean,
    endsAtSwitch: boolean
}