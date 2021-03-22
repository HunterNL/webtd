import { getNextBoundry, getOffsetFromBoundryDistance, isTrack, Track } from "./track";
import { isNumber } from "lodash";
import { resolveBoundry } from "./switch";
import { Entity, getEntityById } from "../interfaces/entity";

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
export type DIRECTION = typeof DIRECTION_FORWARD | typeof DIRECTION_BACKWARD;

export function getDirectionForMovement(movement: number): DIRECTION {
    if(movement > 0) {
        return DIRECTION_FORWARD
    }
    if(movement < 0) {
        return DIRECTION_BACKWARD
    }
    throw new Error("Movement is 0 or an invalid number");
}

export function getRemainingTrackInDirection(postition: TrackPosition, direction: DIRECTION) {
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

export function advanceAlongTrack(entities: Entity[], situation: TrackPosition, movement: number) {
    const currentTrack = situation.track;
    const remainingTrack = currentTrack.length - situation.offset + movement;

    // Simple case, no switch crossing
    if(movementFitsInsideTrack(situation, movement)) {
        situation.offset = situation.offset + movement;
        return;
    }

    // Else we're advancing over a switch... or running a buffer

    const direction = getDirectionForMovement(movement);
    const nextBoundry = getNextBoundry(currentTrack, direction)
    const nextTrackId = resolveBoundry(currentTrack, nextBoundry);
    const remainingDistance = (situation.offset + movement) % currentTrack.length;

    if(!nextTrackId) {
        // Oops
        throw new Error("Buffer overrun, derailed!");
    }

    const nextTrack = getEntityById(entities, nextTrackId, isTrack);
    const newOffset = getOffsetFromBoundryDistance(nextTrack, nextBoundry,Math.abs(remainingDistance))

    situation.track = nextTrack;
    situation.offset = newOffset




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
}

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