import { Entity, getEntityById } from "../interfaces/entity";
import { Ride } from "./ride";
import { advanceAlongTrack, TrackPosition } from "./situation";
import { isTrack } from "./track";
import { segmentContainsPosition } from "./trackSegment";

export type Signal = Entity & {
    position: TrackPosition,
    type: "signal",
    renderData?: {
        label?: string
    }
}

export function loadSignal(entities: Entity[], signalSave: any): Signal {
    const track = getEntityById(entities, signalSave.position.trackId, isTrack);

    return {
        id: signalSave.id,
        position: {
            track,
            offset: signalSave.position.offset
        },
        type: "signal",
        renderData: signalSave.renderData
    }
}

export function isSignalSave(any: any) {
    return any.type === "signal";
}

export function isSignal(any: any): any is Signal {
    return any.type === 'signal'
}

export function lookupSignals(entities: Entity[], ride: Ride, distance: number) {
    const [{segments},_] = advanceAlongTrack(entities, ride.position, distance);

    const allSignals = entities.filter(isSignal);


    // TODO Return in order
    return allSignals.filter(signal => {
        return segments.some(segment => segmentContainsPosition(segment,signal.position))
    })
    
}

