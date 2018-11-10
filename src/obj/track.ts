import {End, isEnd} from "./end";
import { Identifiable, Identifier, isIdentifiable } from "../interfaces/id";
import { Lengthable, isLengthable } from "../interfaces/lengthable";
import { Entity } from "../interfaces/entity";

export type Track = Identifiable & Lengthable & Entity & {
    ends: [End,End],
    length: number
}

export function createTrack(id: Identifier, ends: [End,End],length:number): Track {
    return {id,ends,length, type : "track"}
}

export function trackGetStart(track: Track) {
    return track.ends[0];
}

export function trackGetEnd(track: Track) {
    return track.ends[1];
}

export function isTrack(obj: any): obj is Track {
    return isLengthable(obj) && Array.isArray((obj as any).ends) && (obj as any).ends.every(isEnd) && isIdentifiable(obj);
}