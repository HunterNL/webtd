import { DetectionBlock } from "../obj/detectionBlock";
import { Signal } from "../obj/physical/signal";

export interface HandleTrackClick {
    onBlockClick: (detectionBlock: DetectionBlock) => any;
}
export interface HandleSignalClick {
    onSignalClick: (signal: Signal) => any;
}