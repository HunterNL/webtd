import { Entity, getEntityById } from "../../interfaces/entity";
import { Ride } from "./ride";
import { TrackPosition, advanceAlongTrack } from "./situation";
import { isTrack } from "./track";
import { segmentContainsPosition } from "./trackSegment";

export const ASPECT_STOP = "ASPECT_STOP" as const;
export const ASPECT_PROCEED_SLOW = "ASPECT_PROCEED_SLOW" as const;

export type Aspect = typeof ASPECT_STOP | typeof ASPECT_PROCEED_SLOW;


export type Signal = Entity & {
    position: TrackPosition,
    type: "signal",
    renderData?: {
        label?: string
    }
    currentAspect: Aspect
}

export function loadSignal(entities: Entity[], signalSave: any): Signal {
    const track = getEntityById(entities, signalSave.position.trackId, isTrack);

    const signal =  {
        id: signalSave.id,
        position: {
            track,
            offset: signalSave.position.offset
        },
        type: signalSave.type,
        renderData: signalSave.renderData,
        currentAspect: signalSave.currentAspect || ASPECT_STOP
    }

    return signal

}

export function isSignalSave(any: any) {
    return any.type === "signal";
}

export function isSignal(any: any): any is Signal {
    return any.type === 'signal'
}

export function lookupSignals(entities: Entity[], ride: Ride, distance: number) {
    const [{segments}] = advanceAlongTrack(entities, ride.position, distance);

    const allSignals = entities.filter(isSignal);


    // TODO Return in order
    return allSignals.filter(signal => {
        return segments.some(segment => segmentContainsPosition(segment,signal.position))
    })
    
}

export function toggleSignal(signal: Signal) {
    if(signal.currentAspect == ASPECT_STOP) {
        signal.currentAspect = ASPECT_PROCEED_SLOW
    } else {
        signal.currentAspect = ASPECT_STOP
    }
}
