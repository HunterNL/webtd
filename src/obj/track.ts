import { Identifiable, Identifier, isIdentifiable, isIdentifier } from "../interfaces/id";
import { Lengthable, isLengthable } from "../interfaces/lengthable";
import { Entity, getEntityById } from "../interfaces/entity";
import { TrackBoundry, resolveBoundry, isTrackBoundry } from "./switch";
import { Situation } from "./situation";
import { Ride } from "./ride";

export type Segment = {
    start: number,
    end: number
}

export type Track = Identifiable & Lengthable & Entity & {
    boundries: [TrackBoundry,TrackBoundry],
    length: number
    segments: Segment[]
}

export interface TrackSave extends Identifiable, Lengthable, Entity {
    boundries: [number, number]
}

const IDEAL_SEGMENT_SPACING = 100;
export function generateSegments(length: number): Segment[] {
    const midPoint = length/2;

    if(length<10) {
        return [{
            start:0,
            end: midPoint
        },{
            start:midPoint,
            end: length
        }]
    }

    // Two short segments at the start and end
    const endSegments = [
        {
            start: 0,
            end: 5
        },{
            start: length-5,
            end: length
        }
    ]

    const segmentCount = Math.floor((length-10)/IDEAL_SEGMENT_SPACING);
    const segmentSize = (length-10)/segmentCount;

    const midSegments = [];

    for (let index = 0; index < segmentCount; index++) {
        midSegments.push({
            start: index+5,
            end: index*segmentSize+5
        })
    }

    return endSegments.concat(midSegments);
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
        segments: generateSegments(trackSave.length)
    }
}

export function createTrack(id: Identifier, boundries: [TrackBoundry,TrackBoundry],length:number): Track {
    return {id,boundries,length, type : "track",segments: generateSegments(length)}
}

export function trackGetStart(track: Track): TrackBoundry {
    return track.boundries[0];
}

export function trackGetEnd(track: Track): TrackBoundry {
    return track.boundries[1];
}

export function trackGetOtherEnd(track: Track, boundryId: number): TrackBoundry {
    const start = trackGetStart(track);
    const end = trackGetEnd(track);

    if(boundryId !== start.id && boundryId !== end.id) {
        throw new Error("Given endId is not a boundry of this track");
    }

    if(boundryId === start.id) {
        return end;
    }

    return start;
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

export function trackIsOccupied(tracks: Track[], track: Track, rides: Ride[]): boolean {
    return rides.map(t => t.situation).some(situation => situationIsOnTrack(tracks, track, situation))
}


export function situationIsOnTrack(entities: Entity[], track: Track, position: Situation) {
    return position.track.id === track.id;
}

/**
 * Gets remaining track length towards a given trackboundry
 */
export function getRemainingTrackLength(track: Track,remaining: number,directionId: number) {
    const length = track.length;
    if(directionId === trackGetStart(track).id) {
        return 
    }

}