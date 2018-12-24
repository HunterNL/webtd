import { Identifiable, Identifier, isIdentifiable, isIdentifier } from "../interfaces/id";
import { Lengthable, isLengthable } from "../interfaces/lengthable";
import { Entity, getEntityById } from "../interfaces/entity";
import { TrackBoundry, resolveBoundry, isTrackBoundry } from "./switch";
import { Situation } from "./situation";
import { Ride } from "./ride";

export type Track = Identifiable & Lengthable & Entity & {
    boundries: [TrackBoundry,TrackBoundry],
    length: number
}

export interface TrackSave extends Identifiable, Lengthable, Entity {
    boundries: [number, number]
}

export function isTrackSave(any: any): any is TrackSave {
    return any.type === "track";
}

export function resolveBoundries(entities: Entity[],ids: number[]): [TrackBoundry, TrackBoundry] {
    const entA = getEntityById(entities,ids[0],isTrackBoundry);
    const entB = getEntityById(entities,ids[1],isTrackBoundry);

    if(!entA || !entB) {
        throw new Error("Could not resolve boundry!");
    }

    return [entA, entB]
}

export function trackLoad(entities: Entity[], trackSave: TrackSave): Track {
    return {
        id: trackSave.id,
        boundries: resolveBoundries(entities, trackSave.boundries),
        length: trackSave.length,
        type: "track",
    }
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
        Array.isArray((obj as Track).boundries) && 
        (obj as Track).boundries.every(isTrackBoundry) && 
        isIdentifiable(obj);
}

export function trackIsOccupied(track: Track, rides: Ride[]): boolean {
    return rides.map(t => t.situation).some(situation => situationIsOnTrack(track, situation))
}


export function situationIsOnTrack(track: Track, position: Situation) {
    return position.track.id === track.id;
}