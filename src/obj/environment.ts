import { Track, isTrack, trackGetStart } from "./track";
import { Train, isTrain } from "./train";
import { isObject } from "../util/isObject";
import { Identifiable, isIdentifiable, getId, Identifier } from "../interfaces/id";
import { Entity, getEntityById, isEntity } from "../interfaces/entity";
import { Switch, isSwitch, loadSwitch } from "./switch";
import { Buffer, isBuffer } from "./buffer";
import { Ride, isRide } from "./ride";


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
    switches: Switch[],
    buffers: Buffer[],
}

export function loadEnvironment(map: unknown): Environment {
    if(!isValidSafeData(map)) {
        throw new Error("Invalid save");
    }

    const {entities} = map;
    
    const tracks = entities.filter(isTrack);
    const rides = entities.filter(isRide);
    const switches : Switch[] = entities.filter(isSwitch).map(loadSwitch);
    const buffers : Buffer[] = entities.filter(isBuffer);
    

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