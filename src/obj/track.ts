import { getId, Identifiable, Identifier, isIdentifiable, isIdentifier } from "../interfaces/id";
import { Lengthable, isLengthable } from "../interfaces/lengthable";
import { Entity, getEntityById } from "../interfaces/entity";
import { TrackBoundry, resolveBoundry, isTrackBoundry } from "./switch";
import { Direction, DIRECTION_FORWARD, TrackPosition } from "./situation";
import { Ride } from "./ride";
import { TrackSegment } from "./trackSegment";



// A track is the full lenght of track between two of either a switch or endpoint
export type Track = Identifiable & Lengthable & Entity & {
    boundries: [TrackBoundry,TrackBoundry],
    length: number
    detectionDeviders: number[]
    segments: TrackSegment[],
    renderData?: {
        start: [number,number],
        end: [number, number]
    },
    type: "track"
    
}

export function createTrack(id: number, startBoundry: TrackBoundry, endBoundry: TrackBoundry, length: number): Track {
    return {
        boundries: [startBoundry,endBoundry],
        detectionDeviders: [],
        id,
        length,
        segments: [],
        type: "track"
    }
}

export function getBoundryPosition(track: Track, boundryId: number): number {
    const [entryBoundryId,exitBoundryId] = track.boundries.map(getId);

    if(boundryId === entryBoundryId) {
        return 0
    }

    if(boundryId === exitBoundryId) {
        return track.length;
    }

    throw new Error("Unknown boundryId");
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
        segments: generateSegments(trackSave.length, trackSave.id),
        detectionDeviders: trackSave.detectionDeviders,
        renderData: trackSave.renderData
    }
}

// export function createTrack(id: Identifier, boundries: [TrackBoundry,TrackBoundry],length:number): Track {
//     return {id,boundries,length, type : "track",segments: generateSegments(length)}
// }

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

export function getNextBoundry(track: Track, direction: Direction): TrackBoundry {
    return (direction === DIRECTION_FORWARD ? track.boundries[1] : track.boundries[0]); //Forward = towards the last/second boundry
}

/***   
 * If given boundry between two tracks is a point where the offset flow reverses, AKA both tracks share a "high" or "low" point there
 */
export function boundryReversesTrackDirection(boundry: TrackBoundry, trackA: Track, trackB: Track): boolean {
    const sharesLowPoint = trackA.boundries[0].id === trackB.boundries[0].id;
    const sharesHighPoint = trackB.boundries[1].id === trackB.boundries[1].id;

    return sharesLowPoint || sharesHighPoint;
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


export function situationIsOnTrack(entities: Entity[], track: Track, position: TrackPosition) {
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

// TODO Handle very short pieces of track
export function getOffsetFromBoundryDistance(track: Track, boundry: TrackBoundry, distance: number): number {
    if(boundry.id === track.boundries[0].id) {
        // Entering from the "front", offset is distance
        return distance
    } else {
        //Entering from the "rear", offset is length - distance
        return track.length - distance
    }
}

export function getDirectionAwayFromBoundry(track: Track, boundryId: number): Direction {
    if(track.boundries[0].id === boundryId) {
        return 1
    }
    if(track.boundries[1].id === boundryId) {
        return -1
    }

    throw new Error("Unknown boundryId");
}