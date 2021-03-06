import { DetectionBlock } from "../obj/detectionBlock";
import { Signal } from "../obj/physical/signal";
import { SignalSVGRenderer } from "../render/svg/signalRenderer";

export interface HandleTrackClick {
    onBlockClick: (detectionBlock: DetectionBlock) => any;
}

export interface HandleSignalClick {
    onSignalClickPrimary: (signal: SignalSVGRenderer) => any;
    onSignalClickSecondary: (signal: SignalSVGRenderer) => any;
}