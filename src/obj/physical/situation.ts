import { isNumber } from "lodash";
import { Entity, getEntityById } from "../../interfaces/entity";
import { TrackSpan } from "../trackSpan";
import { resolveBoundary } from "./switch";
import { getBoundaryPosition, getDirectionAwayFromBoundary, trackGetBoundaryInDirection, isTrack, Track } from "./track";
import { TrackSegment } from "./trackSegment";


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

export function isTrackPos(any: any): any is TrackPosition {
    return typeof any.offset === "number" && isTrack(any.track);
}

export function getDirectionForMovement(movement: number): Direction {
    if(movement > 0) {
        return DIRECTION_FORWARD
    }
    if(movement < 0) {
        return DIRECTION_BACKWARD
    }
    throw new Error("Movement is 0 or an invalid number");
}

export function getRemainingTrackInDirection(postition: TrackPosition, direction: Direction): number {
    if(direction === DIRECTION_FORWARD) {
        return postition.track.length - postition.offset;
    }
    if(direction === DIRECTION_BACKWARD) {
        return postition.offset
    }

    throw new Error("Unkown direction");
}

export function movementFitsInsideTrack(position: TrackPosition, movement: number): boolean {
    const newOffset = position.offset + movement;

    return newOffset >= 0 && newOffset <= position.track.length;
}

/**
 * Get absolute distance to boundary from current position
 * @param position 
 * @param boundaryId 
 */
function getDistanceToBoundary(position: TrackPosition, boundaryId: number): number {
    const [entryBoundary, exitBoundary] = position.track.boundries;

    if(boundaryId === entryBoundary.id) {
        return position.offset
    } else if (boundaryId === exitBoundary.id) {
        return position.track.length - position.offset;
    } 

    throw new Error("No boundary with id " + boundaryId);
}

/***   
 * Moves the given situation object by the given object, taking switch positions into account
 */
export function advanceAlongTrack(entities: Entity[], situation: TrackPosition, movement: number): [TrackSpan, boolean] {
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
        // Figure out the next boundary we're gonna hit

        const direction = getDirectionForMovement(movementLeft)
        const nextBoundary = trackGetBoundaryInDirection(currentPosition.track, direction);
        const distanceToBoundary = getDistanceToBoundary(currentPosition, nextBoundary.id);
    
        // Save the segment we "traveled"
        const segment : TrackSegment = {
            start: currentPosition.offset,
            end: currentPosition.offset+distanceToBoundary*direction,
            trackId: currentPosition.track.id
        }
        segments.push(segment);

        const nextTrackId = resolveBoundary(currentPosition.track,nextBoundary);

        if(typeof nextTrackId === "undefined") {


            return [{
                segments,
                finalDirection: direction,
                startPosition: situation,
                endPosition: currentPosition
            },false]
            // Oops
            throw new Error("Buffer overrun, derailed!");
        }

        const nextTrack = getEntityById(entities, nextTrackId, isTrack);

        // And advance to the next track.
        currentPosition.offset = getBoundaryPosition(nextTrack, nextBoundary.id);
        currentPosition.track = nextTrack;

        // Subtract movement
        movementLeft = movementLeft - (distanceToBoundary * direction);

        // Reverse our movementLeft if we need to
        const continueDirectionAfterBoundary = getDirectionAwayFromBoundary(nextTrack, nextBoundary.id);
        if(continueDirectionAfterBoundary !== direction) {
            movementLeft = movementLeft * -1;
        }        

        // Little failsafe, might aid in debugging 
        if(Math.abs(movementLeft) > Math.abs(movement)) {
            throw new Error("Logic error, movementleft should never exceed movement")
        }
    }

    // At this point we're left inside a single track
    const segment : TrackSegment = {
        start: currentPosition.offset,
        end: currentPosition.offset+movementLeft,
        trackId: currentPosition.track.id
    }

    segments.push(segment);

    currentPosition.offset = currentPosition.offset + movementLeft;

    return [{
        startPosition: situation,
        endPosition: currentPosition,
        segments,
        finalDirection: getDirectionForMovement(movementLeft)
    },true]
    
}

export function situationRoomBehind(situation: TrackPosition) {
    return getRemainingTrackInDirection(situation,DIRECTION_BACKWARD)
}
export function isSituationSave(any: any): any is SituationSave {
    return isNumber(any.trackId) && isNumber(any.offset);
}


export function getDistanceToPosition(from: TrackPosition, to: TrackPosition, via?: TrackSpan): number {
    if(from.track.id !== to.track.id) {
        console.warn("Distance across tracks unimplemented"); // Should throw
        return Number.MAX_SAFE_INTEGER;
    }

    if(via) {
        throw new Error("Unimplemented");
    }

    return to.offset - from.offset;
}