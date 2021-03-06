import { last } from "lodash";
import { Entity, getEntityById } from "../../interfaces/entity";
import { Identifier } from "../../interfaces/id";
import { Path } from "../interlocking/path";
import { Saveable } from "../save";
import { Ride, rideGetDrivingPosition } from "./ride";
import { advanceAlongTrack, Direction, DIRECTION_BACKWARD, DIRECTION_FORWARD, TrackPosition } from "./situation";
import { isTrack, isWeld, Track, trackGetSignalFeature, TrackWeld, weldGetAjoiningSegments } from "./track";
import { segmentContainsPosition } from "./trackSegment";

export const ASPECT_STOP = "ASPECT_STOP" as const;
export const ASPECT_PROCEED_SLOW = "ASPECT_PROCEED_SLOW" as const;

export type Aspect = typeof ASPECT_STOP | typeof ASPECT_PROCEED_SLOW;

export type Signal = Entity & {
    position: TrackPosition,
    snappedToWeld: boolean
    type: "signal",
    renderData?: {
        label?: string
    }
    currentAspect: Aspect,
    direction: Direction,
    possiblePaths: Path[],
    routeable: true
}

export type SignalSave = Saveable<Signal> & {
    snapToWeld: boolean
}

export function loadSignal(entities: Entity[], signalSave: SignalSave): Signal {
    const track = getEntityById(entities, signalSave.position.track, isTrack);
    const position = {
        track, offset: signalSave.position.offset
    }
    const {id, direction, snapToWeld} = signalSave

    return signalCreate(id, track, direction, snapToWeld,signalSave.position.offset)

    // const signal : Signal =  {
    //     id: signalSave.id,
    //     position,
    //     type: signalSave.type,
    //     renderData: signalSave.renderData,
    //     currentAspect: signalSave.currentAspect || ASPECT_STOP,
    //     possiblePaths: [],
    //     direction: signalSave.direction,
    //     routeable: snapToWeld,
    // }

    // return signal
}

export function signalCreate(id: Identifier, track: Track, direction: Direction, snap: boolean, offset?: number): Signal {
    let realoffset = -1;

    if(!snap) {
        if(typeof offset !== "number") {
            throw new Error("Signals not snapped need an offset supplied");
        }
        realoffset = offset
    } else {
        realoffset = trackGetSignalFeature(track, id).position;
    }

    return {
        id,
        currentAspect: "ASPECT_STOP",
        direction,
        position: {
            offset: realoffset,
            track
        },
        routeable: true,
        snappedToWeld: snap,
        type: "signal",
        possiblePaths: []
    }
}

export function isSignalSave(any: any): any is SignalSave {
    return any.type === "signal";
}

export function isSignal(any: any): any is Signal {
    return any.type === 'signal'
}

export function lookupSignals(entities: Entity[], ride: Ride, distance: number) {
    const driverPosition = rideGetDrivingPosition(ride)
    const [{segments}] = advanceAlongTrack(entities, driverPosition, distance);

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

export function searchPathToTrack(signal: Signal, trackId: Identifier): Path | undefined {
    return signal.possiblePaths.find(path => last(path.segments)?.trackId === trackId)
}

export function signalGetSegmentAhead(signal: Signal) {
    if(!signal.snappedToWeld) {
        throw new Error("Signal must be on a segment border to get the next segment");
    }

    const track = signal.position.track;

    const weld = track.features.find(feature => isWeld(feature) && feature.signalIds.includes(signal.id)) as TrackWeld; // TS doesn't narrow to TrackWeld
    const segments = weldGetAjoiningSegments(track, weld);

    if(signal.direction === DIRECTION_FORWARD) {
        return segments.front;
    }

    if(signal.direction == DIRECTION_BACKWARD) {
        return segments.back;
    }

    throw new Error("wtf"); // Unreachable (?)
}

export function signalGetWeld(signal: Signal): TrackWeld {
    const weld = signal.position.track.features.find(feature => isWeld(feature) && feature.signalIds.includes(signal.id)) as TrackWeld
    if(!weld) {
        throw new Error("Weld not found");
    }
    return weld;
}