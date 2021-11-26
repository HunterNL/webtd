import { Entity } from "../../interfaces/entity";
import { joinWith } from "../../util/joinWith";
import { Signal, signalGetWeld } from "../physical/signal";
import { Direction, TrackPosition } from "../physical/situation";
import { isSwitch, switchGetStateForPath, SwitchState, TrackBoundary, TrackSwitch } from "../physical/switch";
import { Track, trackGetBoundaryInDirection } from "../physical/track";
import { TrackSegment } from "../physical/trackSegment";
import { findRoutes } from "./findRoutes";

export type Path = {
    signal: Signal,
    switchStates: Map<TrackSwitch, SwitchState>,
    segments: TrackSegment[],
}

function findCommonBoundary(leftSegment: TrackSegment, rightSegment: TrackSegment): TrackBoundary {
    if (leftSegment.startBoundary) {
        if (leftSegment.startBoundary.id === rightSegment.startBoundary?.id) {
            return leftSegment.startBoundary;
        }

        if (leftSegment.startBoundary.id === rightSegment.endBoundary?.id) {
            return leftSegment.startBoundary;
        }
    }

    if (leftSegment.endBoundary) {
        if (leftSegment.endBoundary.id === rightSegment.startBoundary?.id) {
            return leftSegment.endBoundary;
        }

        if (leftSegment.endBoundary.id === rightSegment.endBoundary?.id) {
            return leftSegment.endBoundary;
        }
    }

    throw new Error("No connection found");
}

function pathFromSpan(entities: Entity[], segments: TrackSegment[], signal: Signal): Path {
    const switchMap = new Map<TrackSwitch, SwitchState>();

    if (segments.length > 1) {
        joinWith(segments, (a, b) => {
            if (a.trackId !== b.trackId) {
                const trackBoundary = findCommonBoundary(a, b);

                if (!isSwitch(trackBoundary)) {
                    throw new Error("wtf");
                }

                const state = switchGetStateForPath(trackBoundary, [a.trackId, b.trackId])

                switchMap.set(trackBoundary, state)
            }
        })
    }

    return {
        signal,
        switchStates: switchMap,
        segments,
    }
}

export function pathsFromSignal(entities: Entity[], signal: Signal) {
    const { direction } = signal;
    const track = signal.position.track;
    const nextBoundary = trackGetBoundaryInDirection(track, direction)
    const weld = signalGetWeld(signal)
    return findRoutes(entities, track, weld, nextBoundary,).map(span => {
        return pathFromSpan(entities, span, signal)
    })
}

// export function pathsfromLocation(entities: Entity[], position: TrackPosition ,direction: Direction, signal: Signal): Path[] {
//     return findRoutes(entities, position, direction).map(span => {
//         return pathFromSpan(entities, span, signal)
//     })
// }