import { getBoundryPosition, getDirectionAwayFromBoundry, getNextBoundry, getOffsetFromBoundryDistance, isTrack, Track } from "./track";
import { isNumber } from "lodash";
import { isTrackBoundry, resolveBoundry, TrackBoundry } from "./switch";
import { Entity, getEntityById } from "../interfaces/entity";
import { TrackSpan } from "./trackSpan";
import { createSegment, TrackSegment } from "./trackSegment";

export type TrackPosition = {
    track: Track,
    offset: number,
}

export type DirectionalTrackPosition = TrackPosition & {
    facingForward: boolean;
}

export type SituationSave = {
    trackId: number,
    position: number
}

export type DirectionalSitationSave = SituationSave & {
    facingFoward: boolean
}

export const DIRECTION_FORWARD = 1;
export const DIRECTION_BACKWARD = -1;
export type Direction = typeof DIRECTION_FORWARD | typeof DIRECTION_BACKWARD;

export function getDirectionForMovement(movement: number): Direction {
    if(movement > 0) {
        return DIRECTION_FORWARD
    }
    if(movement < 0) {
        return DIRECTION_BACKWARD
    }
    throw new Error("Movement is 0 or an invalid number");
}

export function getRemainingTrackInDirection(postition: TrackPosition, direction: Direction) {
    if(direction === DIRECTION_FORWARD) {
        return postition.track.length - postition.offset;
    }
    if(direction === DIRECTION_BACKWARD) {
        return postition.offset
    }

    throw new Error("Unkown direction");
}

export function movementFitsInsideTrack(position: TrackPosition, movement: number) {
    const newOffset = position.offset + movement;

    return newOffset >= 0 && newOffset <= position.track.length;
}

/**
 * Get absolute distance to boundry from current position
 * @param position 
 * @param boundryId 
 */
function getDistanceToBoundry(position: TrackPosition, boundryId: number): number {
    const [entryBoundry, exitBoundry] = position.track.boundries;

    if(boundryId === entryBoundry.id) {
        return position.offset
    } else if (boundryId === exitBoundry.id) {
        return position.track.length - position.offset;
    } 

    throw new Error("No boundry with id " + boundryId);
}

/***   
 * Moves the given situation object by the given object, taking switch positions into account
 */
export function advanceAlongTrack(entities: Entity[], situation: TrackPosition, movement: number): TrackSpan {
    const segments: TrackSegment[] = []; // For returning

    /**
     * This isn't frozen, gets updated in the loop below
     */
    const currentPosition : TrackPosition  = {
        offset: situation.offset,
        track: situation.track
    }
    let movementLeft = movement;

    while(!movementFitsInsideTrack(currentPosition, movementLeft)) {
        // Figure out the next boundry we're gonna hit

        const direction = getDirectionForMovement(movementLeft)
        const nextBoundry = getNextBoundry(currentPosition.track, direction);
        const distanceToBoundry = getDistanceToBoundry(currentPosition, nextBoundry.id);
        const nextTrackId = resolveBoundry(currentPosition.track,nextBoundry);
        
        if(!nextTrackId) {
            // Oops
            throw new Error("Buffer overrun, derailed!");
        }

        const nextTrack = getEntityById(entities, nextTrackId, isTrack);

        // Save the segment we "traveled"
        const segment = createSegment(currentPosition.track.id,currentPosition.offset,currentPosition.offset+distanceToBoundry*direction)
        segments.push(segment);

        // And advance to the next track.
        currentPosition.offset = getBoundryPosition(nextTrack, nextBoundry.id);
        currentPosition.track = nextTrack;

        const continueDirectionAfterBoundry = getDirectionAwayFromBoundry(nextTrack, nextBoundry.id);

        movementLeft = movementLeft - (distanceToBoundry * direction);

        if(continueDirectionAfterBoundry !== direction) {
            movementLeft = movementLeft * -1;
        }        

        if(Math.abs(movementLeft) > Math.abs(movement)) {
            throw new Error("Logic error, movementleft should never exceed movement")
        }
    }
    // At this point we're left inside a single track

    // const segment = createSegment()

    const segment = createSegment(currentPosition.track.id,currentPosition.offset,currentPosition.offset+movementLeft);

    segments.push(segment);

    currentPosition.offset = currentPosition.offset + movementLeft;

    return {
        startPosition: situation,
        endPosition: currentPosition,
        segments
    }
    
}


    // Else we're advancing over a switch... or running a buffer

    // const nextTrackId = resolveBoundry(currentTrack, nextBoundry);
    // const remainingDistance = (situation.offset + movement) % currentTrack.length;


    // const nextTrack = getEntityById(entities, nextTrackId, isTrack);
    // const newOffset = getOffsetFromBoundryDistance(nextTrack, nextBoundry,Math.abs(remainingDistance))

    // const endPosition: TrackPosition = {
    //     offset: newOffset,
    //     track: nextTrack
    // }

    // return {
    //     startPosition,
    //     endPosition,
    //     segments: []
    // }




    // TODO Handle very short pieces of track
    // const overFlowRoom = movement - situation.remainingTrack;

    
    // const nextTrack = trackGetNext(entities, currentTrack);

    // if(!nextTrack) {
    //     console.log("Train crashed");
    //     return;
    //     // TODO Handle nicer
    // }

    // situation.track = nextTrack;
    // situation.direction = trackGetOtherEnd(nextTrack, situation.direction).id;
    // situation.remainingTrack = nextTrack.length - overFlowRoom;


// export function createSituation(track: Track, remainingTrack: number, direction: number): TrackPosition {
//     return {
//         remainingTrack,  track, direction
//     }
// }

export function situationRoomBehind(situation: TrackPosition) {
    return getRemainingTrackInDirection(situation,DIRECTION_BACKWARD)
}
export function isSituationSave(any: any): any is SituationSave {
    return isNumber(any.trackId) && isNumber(any.offset);
}

// export function situationIsValidForLength(situation: Situation, length: number): boolean {
//     const track = situation.track;
//     const position = situation.position;
//     const trackLength = track.length;

//     if(position>trackLength) {
//         return false; // Train front exceeds track length
//     }

//     if(position-length<0) {
//         return false; // Train escapes end
//     }

//     return true;
// }