import { Track, isTrack } from "./track";
import { Train, isTrain } from "./train";
import { isObject } from "../util/isObject";
import { Identifiable, isIdentifiable } from "../interfaces/id";
import { Entity } from "../interfaces/entity";


export type EnvironmentSave = {
    entities: Entity[]
}

export function isValidSafeData(any: any): any is EnvironmentSave {
    return Array.isArray(any.entities) && any.entities.every(isIdentifiable);
}

export type Environment=  {
    tracks: Track[],
    trains: Train[]
}

export function loadEnvironment(map: unknown): Environment {
    if(!isValidSafeData(map)) {
        throw new Error("Invalid save");
    }

    const {entities} = map;

    const tracks: Track[] = entities.filter(isTrack);
    const trains: Train[] = entities.filter(isTrain);

    

    return {
        tracks,
        trains,
    }
}