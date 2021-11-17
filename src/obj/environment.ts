import { Entity, getEntityById, isEntity } from "../interfaces/entity";
import { Identifier, isIdentifiable } from "../interfaces/id";
import { Interlocking } from "./interlocking/interlocking";
import { pathsfromLocation } from "./interlocking/path";
import { Buffer, isBuffer } from "./physical/buffer";
import { isRideSave, loadRide, Ride } from "./physical/ride";
import { isSignal, isSignalSave, loadSignal, Signal } from "./physical/signal";
import { isSwitch, loadSwitch, TrackSwitch } from "./physical/switch";
import { isTrack, isTrackSave, Track, trackLoad } from "./physical/track";
import { TrackSegment } from "./physical/trackSegment";
import { isTrain, Train } from "./physical/train";


export type EnvironmentSave = {
    entities: Entity[]
}

export function isValidSafeData(any: any): any is EnvironmentSave {
    return Array.isArray(any.entities) && any.entities.every(isIdentifiable);
}

export type PhysicalEnvironment=  {
    tracks: Track[],
    rides: Ride[],
    entities: Entity[],
    switches: TrackSwitch[],
    buffers: Buffer[],
    signals: Signal[],
}

export type DynamicEnvironment = {
    occupiedTrackSegments: TrackSegment[],
    switchPositions: TrackSwitch[], // For now just the entire object
    occupationMap: Map<TrackSegment,Ride> // temp till we simulate TVT / TROTS
    interLocking: Interlocking
}

export function finalizeEntities(entities: Entity[]) {
    entities.filter(isSignal).forEach(signal => signal.possiblePaths = pathsfromLocation(entities, signal.position, signal.direction, signal))
}

export function loadEnvironment(map: unknown): PhysicalEnvironment {
    if(!isValidSafeData(map)) {
        throw new Error("Invalid save");
    }

    const {entities: entitiesSaves} = map;
    
    const buffers : Buffer[] = entitiesSaves.filter(isBuffer);
    const switches : TrackSwitch[] = entitiesSaves.filter(isSwitch).map(loadSwitch);
    const trains:  Train[] = entitiesSaves.filter(isTrain);

    const trackBoundries = ([] as Entity[]).concat(buffers,switches);

    const trackSaves = entitiesSaves.filter(isTrackSave);

    const tracks: Track[] = trackSaves.map(trackSave => trackLoad(trackBoundries, trackSave));

    const tracksAndTrains = ([] as Entity[]).concat(tracks,trains);

    const rides: Ride[] = entitiesSaves.filter(isRideSave).map(rideSave => loadRide(tracksAndTrains, rideSave));    

    const signals: Signal[] = entitiesSaves.filter(isSignalSave).map(signalSave => loadSignal(tracks, signalSave))

    const entities: Entity[] = ([] as Entity[]).concat(tracks,rides,switches,buffers, signals);


    finalizeEntities(entities)
    

    return {
        tracks,
        rides,
        entities,
        switches,
        buffers,
        signals
    }
}

export function getNextFreeId(env: PhysicalEnvironment): number {
    for(let n = 0; n < Number.MAX_SAFE_INTEGER; n++) {
        if(env.entities.find(ent => ent.id === n)) continue;
        return n;
    }

    throw new Error("Something went terribly wrong finding a free number");
}
export function verifyConnections(env: PhysicalEnvironment): void {
    const getEnt = (n: Identifier) => getEntityById(env.entities,n,isEntity);

    env.tracks.forEach(track => track.boundries.forEach(boundary => getEnt(boundary.id)));
    env.switches.forEach(trackSwitch => {
        trackSwitch.junction.straightConnections.map(connection => connection.forEach(trackId => getEntityById(env.entities, trackId, isTrack)))
        trackSwitch.junction.sideConnections.map(connection => connection.forEach(trackId => getEntityById(env.entities, trackId, isTrack)))
    })
    
    // env.switches.forEach(swi => swi.junction.sideConnections.f)
}
