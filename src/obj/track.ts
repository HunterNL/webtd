import { Entity, getEntityById } from "../interfaces/entity";
import { getId, Identifiable, isIdentifiable } from "../interfaces/id";
import { isLengthable, Lengthable } from "../interfaces/lengthable";
import { Direction, DIRECTION_FORWARD, TrackPosition } from "./situation";
import { isTrackBoundary, resolveBoundary, TrackBoundary } from "./switch";
import { splitTrackAtPoints, TrackSegment } from "./trackSegment";



// A track is the full lenght of track between two of either a switch or endpoint
export type Track = Identifiable & Lengthable & Entity & {
    boundries: [TrackBoundary,TrackBoundary],
    length: number
    detectionDeviders: number[]
    renderData?: {
        start: [number,number],
        end: [number, number]
    },
    type: "track",
    segments: {
        detection: TrackSegment[]
    }
    
}

export function createTrack(id: number, startBoundary: TrackBoundary, endBoundary: TrackBoundary, length: number): Track {
    return {
        boundries: [startBoundary,endBoundary],
        detectionDeviders: [],
        id,
        length,
        segments: {detection:[]},
        type: "track"
    }
}

export function getBoundaryPosition(track: Track, boundaryId: number): number {
    const [entryBoundaryId,exitBoundaryId] = track.boundries.map(getId);

    if(boundaryId === entryBoundaryId) {
        return 0
    }

    if(boundaryId === exitBoundaryId) {
        return track.length;
    }

    throw new Error("Unknown boundaryId");
}

export interface TrackSave extends Identifiable, Lengthable, Entity {
    detectionDeviders: number[];
    boundries: [number, number],
    renderData: any,
}

const IDEAL_SEGMENT_SPACING = 100;
export function generateSegments(length: number, trackId: number): TrackSegment[] {
    const midPoint = length/2;

    if(length<10) {
        return [{
            trackId,
            start:0,
            end: midPoint
        },{
            trackId,
            start:midPoint,
            end: length
        }]
    }

    // Two short segments at the start and end
    const endSegments : TrackSegment []= [
        {
            start: 0,
            end: 5,
            trackId

        },{
            start: length-5,
            end: length,
            trackId
        }
    ]

    const segmentCount = Math.floor((length-10)/IDEAL_SEGMENT_SPACING);
    const segmentSize = (length-10)/segmentCount;

    const midSegments : TrackSegment[] = [];

    for (let index = 0; index < segmentCount; index++) {
        midSegments.push({
            start: index+5,
            end: index*segmentSize+5,
            trackId
        })
    }

    return endSegments.concat(midSegments);
}

export function isTrackSave(any: any): any is TrackSave {
    return any.type === "track";
}

export function resolveBoundries(entities: Entity[],ids: number[]): [TrackBoundary, TrackBoundary] {
    const entA = getEntityById(entities,ids[0],isTrackBoundary);
    const entB = getEntityById(entities,ids[1],isTrackBoundary);

    if(!entA || !entB) {
        throw new Error("Could not resolve boundary!");
    }

    return [entA, entB]
}

export function trackLoad(entities: Entity[], trackSave: TrackSave): Track {
    const trackId = trackSave.id;

    return {
        id: trackId,
        boundries: resolveBoundries(entities, trackSave.boundries),
        length: trackSave.length,
        type: "track",
        segments: {
            detection: splitTrackAtPoints(trackId, trackSave.length, trackSave.detectionDeviders)
        }, // generateSegments(trackSave.length, trackSave.id),
        detectionDeviders: trackSave.detectionDeviders,
        renderData: trackSave.renderData
    }
}

export function trackGetStart(track: Track): TrackBoundary {
    return track.boundries[0];
}

export function trackGetEnd(track: Track): TrackBoundary {
    return track.boundries[1];
}

export function trackGetOtherEnd(track: Track, boundaryId: number): TrackBoundary {
    const start = trackGetStart(track);
    const end = trackGetEnd(track);

    if(boundaryId !== start.id && boundaryId !== end.id) {
        throw new Error("Given endId is not a boundary of this track");
    }

    if(boundaryId === start.id) {
        return end;
    }

    return start;
}

export function getNextBoundary(track: Track, direction: Direction): TrackBoundary {
    return (direction === DIRECTION_FORWARD ? track.boundries[1] : track.boundries[0]); //Forward = towards the last/second boundary
}

/***   
 * If given boundary between two tracks is a point where the offset flow reverses, AKA both tracks share a "high" or "low" point there
 */
export function boundaryReversesTrackDirection(boundary: TrackBoundary, trackA: Track, trackB: Track): boolean {
    const sharesLowPoint = trackA.boundries[0].id === trackB.boundries[0].id;
    const sharesHighPoint = trackB.boundries[1].id === trackB.boundries[1].id;

    return sharesLowPoint || sharesHighPoint;
}

export function trackGetNext(entities: Entity[], track: Track) : Track | undefined {
    const boundary = trackGetEnd(track)
    const nextId = resolveBoundary(track, boundary);

    if(!nextId) return;

    return getEntityById(entities,nextId,isTrack);
}

export function isTrack(obj: any): obj is Track {
    return isLengthable(obj) && 
        Array.isArray((obj as Track).boundries) && 
        (obj as Track).boundries.every(isTrackBoundary) && 
        isIdentifiable(obj);
}

export function situationIsOnTrack(entities: Entity[], track: Track, position: TrackPosition): boolean {
    return position.track.id === track.id;
}

// TODO Handle very short pieces of track
export function getOffsetFromBoundaryDistance(track: Track, boundary: TrackBoundary, distance: number): number {
    if(boundary.id === track.boundries[0].id) {
        // Entering from the "front", offset is distance
        return distance
    } else {
        //Entering from the "rear", offset is length - distance
        return track.length - distance
    }
}

export function getDirectionAwayFromBoundary(track: Track, boundaryId: number): Direction {
    if(track.boundries[0].id === boundaryId) {
        return 1
    }
    if(track.boundries[1].id === boundaryId) {
        return -1
    }

    throw new Error("Unknown boundaryId");
}