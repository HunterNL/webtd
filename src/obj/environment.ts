import { flatten, zipWith } from "lodash";
import { Entity, getEntityById, isEntity } from "../interfaces/entity";
import { Identifier, isIdentifiable } from "../interfaces/id";
import { Buffer, isBuffer } from "./buffer";
import { DetectionBlock } from "./detectionBlock";
import { isRideSave, loadRide, Ride } from "./ride";
import { isSignalSave, loadSignal, Signal } from "./signal";
import { isSwitch, loadSwitch, TrackSwitch } from "./switch";
import { isTrack, isTrackSave, Track, trackLoad, trackRenderLoad } from "./track";
import { TrackSegment } from "./trackSegment";
import { isTrain, Train } from "./train";


export type EnvironmentSave = {
    entities: Entity[]
}

export function isValidSafeData(any: any): any is EnvironmentSave {
    return Array.isArray(any.entities) && any.entities.every(isIdentifiable);
}

export type Environment=  {
    tracks: Track[],
    rides: Ride[],
    entities: Entity[],
    switches: TrackSwitch[],
    buffers: Buffer[],
    signals: Signal[],
    detectionBlocks: DetectionBlock[]
}

export type DynamicEnvironment = {
    occupiedTrackSegments: TrackSegment[],
    switchPositions: TrackSwitch[], // For now just the entire object
}

export function loadEnvironment(map: unknown): Environment {
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

    const detectionBlocks = flatten(zipWith(tracks, trackSaves, trackRenderLoad));

    return {
        tracks,
        rides,
        entities,
        switches,
        buffers,
        signals,
        detectionBlocks
    }
}

export function getNextFreeId(env: Environment): number {
    for(let n = 0; n < Number.MAX_SAFE_INTEGER; n++) {
        if(env.entities.find(ent => ent.id === n)) continue;
        return n;
    }

    throw new Error("Something went terribly wrong finding a free number");
}
export function verifyConnections(env: Environment): void {
    const getEnt = (n: Identifier) => getEntityById(env.entities,n,isEntity);

    env.tracks.forEach(track => track.boundries.forEach(boundary => getEnt(boundary.id)));
    env.switches.forEach(trackSwitch => {
        trackSwitch.junction.straightConnections.map(connection => connection.forEach(trackId => getEntityById(env.entities, trackId, isTrack)))
        trackSwitch.junction.sideConnections.map(connection => connection.forEach(trackId => getEntityById(env.entities, trackId, isTrack)))
    })
    
    // env.switches.forEach(swi => swi.junction.sideConnections.f)
}
