import { Track, isTrack, trackGetStart, trackLoad, isTrackSave } from "./track";
import { Train, isTrain } from "./train";
import { isObject } from "../util/isObject";
import { Identifiable, isIdentifiable, getId, Identifier } from "../interfaces/id";
import { Entity, getEntityById, isEntity } from "../interfaces/entity";
import { TrackSwitch, isSwitch, loadSwitch } from "./switch";
import { Buffer, isBuffer } from "./buffer";
import { Ride, isRide, loadRide, isRideSave } from "./ride";


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
}

export function loadEnvironment(map: unknown): Environment {
    if(!isValidSafeData(map)) {
        throw new Error("Invalid save");
    }

    const {entities: entitiesSaves} = map;

    console.log(entitiesSaves)
    
    const buffers : Buffer[] = entitiesSaves.filter(isBuffer);
    const switches : TrackSwitch[] = entitiesSaves.filter(isSwitch).map(loadSwitch);
    const trains:  Train[] = entitiesSaves.filter(isTrain);

    const trackBoundries = ([] as Entity[]).concat(buffers,switches);

    const tracks: Track[] = entitiesSaves.filter(isTrackSave).map(trackSave => trackLoad(trackBoundries, trackSave));

    const tracksAndTrains = ([] as Entity[]).concat(tracks,trains);

    const rides: Ride[] = entitiesSaves.filter(isRideSave).map(rideSave => loadRide(tracksAndTrains, rideSave));    

    console.log(4,rides)

    const entities: Entity[] = ([] as any[]).concat(tracks,rides,switches,buffers);

    return {
        tracks,
        rides,
        entities,
        switches,
        buffers
    }
}

export function getNextFreeId(env: Environment): number {
    let n = -1;
    while(true) {
        n = n + 1;
        if(env.entities.find(ent => ent.id === n)) continue;
        return n
    }
}
export function verifyConnections(env: Environment): void {
    const trackIds = env.tracks.map(getId);
    const bufferIds = env.buffers.map(getId);
    const switchIds = env.switches.map(getId);

    const getEnt = (n: Identifier) => getEntityById(env.entities,n,isEntity);

    env.tracks.forEach(track => track.boundries.forEach(boundry => getEnt(boundry.id)));
    
    // env.switches.forEach(swi => swi.junction.sideConnections.f)
}