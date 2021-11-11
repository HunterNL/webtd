import { Entity, getEntityById } from "../interfaces/entity";
import { HandleSignalClick, HandleTrackClick } from "../interfaces/eventHandlers";
import { DetectionBlock } from "./detectionBlock";
import { DynamicEnvironment, PhysicalEnvironment } from "./environment";
import { Interlocking } from "./interlocking/interlocking";
import { isSignal, Signal } from "./physical/signal";
import { isTrack } from "./physical/track";

export class UserInput implements HandleTrackClick, HandleSignalClick {
    currentSelection: Entity | undefined;
    interlocking: Interlocking;

    constructor(public env: PhysicalEnvironment, public dynenv: DynamicEnvironment) {
        this.interlocking = dynenv.interLocking;
    }

    onSignalClick(signal: Signal) {
        this.currentSelection = signal
    }

    onBlockClick(detectionBlock: DetectionBlock) {
        const trackId = detectionBlock.segment.trackId;
        const track = getEntityById(this.env.tracks, trackId, isTrack)

        if(this.currentSelection) {
            if(isSignal(this.currentSelection)) {
                const path = this.currentSelection.possiblePaths.find(path => path.toTrack.id === detectionBlock.segment.trackId)

                if(path) {
                    this.interlocking.setPath(path)
                }
            }
        }

        this.currentSelection = track;
    }
}