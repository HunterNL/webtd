import { Identifiable, Identifier, isIdentifiable, isIdentifier } from "../interfaces/id";
import { Lengthable, isLengthable } from "../interfaces/lengthable";
import { Entity, getEntityById } from "../interfaces/entity";
import { TrackBoundry, resolveBoundry } from "./switch";
import { Situation } from "./situation";
import { Ride } from "./ride";

export type Track = Identifiable & Lengthable & Entity & {
    boundries: [TrackBoundry,TrackBoundry],
    length: number
}

export function createTrack(id: Identifier, boundries: [TrackBoundry,TrackBoundry],length:number): Track {
    return {id,boundries,length, type : "track"}
}

export function trackGetStart(track: Track): TrackBoundry {
    return track.boundries[0];
}

export function trackGetEnd(track: Track): TrackBoundry {
    return track.boundries[1];
}

export function trackGetNext(entities: Entity[], track: Track) : Track | undefined {
    const boundry = trackGetEnd(track)
    const nextId = resolveBoundry(track, boundry);

    if(!nextId) return;

    return getEntityById(entities,nextId,isTrack);
}

export function isTrack(obj: any): obj is Track {
    return isLengthable(obj) && 
        Array.isArray((obj as any).ends) && 
        (obj as any).ends.every(isIdentifier) && 
        isIdentifiable(obj);
}

export function trackIsOccupied(track: Track, trains: Ride[]) {
    return trains.map(t => t.situation).some(situation => situationIsOnTrack(track, situation))
}


export function situationIsOnTrack(track: Track, position: Situation) {
    return position.track.id === track.id;
}