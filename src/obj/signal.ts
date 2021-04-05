import { Entity, getEntityById } from "../interfaces/entity";
import { TrackPosition } from "./situation";
import { isTrack } from "./track";

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