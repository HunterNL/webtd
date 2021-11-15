import { Entity, getEntityById } from "../interfaces/entity";
import { HandleSignalClick, HandleTrackClick } from "../interfaces/eventHandlers";
import { SignalSVGRenderer } from "../render/svg/signalRenderer";
import { DetectionBlock } from "./detectionBlock";
import { DynamicEnvironment, PhysicalEnvironment } from "./environment";
import { Interlocking } from "./interlocking/interlocking";
import { isTrack } from "./physical/track";

export class UserInput implements HandleTrackClick, HandleSignalClick {
    currentSelection: Entity | undefined;
    currentSignal: SignalSVGRenderer | undefined;
    interlocking: Interlocking;

    constructor(public env: PhysicalEnvironment, public dynenv: DynamicEnvironment) {
        this.interlocking = dynenv.interLocking;
    }

    onSignalClick(signal: SignalSVGRenderer) {
        this.deSelectSignal()
        this.selectSignal(signal)
    }

    onBlockClick(detectionBlock: DetectionBlock) {
        const trackId = detectionBlock.segment.trackId;
        const track = getEntityById(this.env.tracks, trackId, isTrack)

        if(this.currentSignal) {
            const path = this.currentSignal.signal.possiblePaths.find(path => path.toTrack.id === detectionBlock.segment.trackId)

            if(path) {
                this.interlocking.setPath(path)            
            }
        }

        this.deSelectSignal()
    }

    selectSignal(signal: SignalSVGRenderer) {
        this.currentSignal = signal

        this.currentSignal.highlighted = true;
    }

    deSelectSignal() {
        if(!this.currentSignal) return; 

        this.currentSignal.highlighted = false;
        this.currentSignal = undefined
    }

    
}