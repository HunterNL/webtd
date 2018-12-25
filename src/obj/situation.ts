import { Identifier } from "../interfaces/id";
import { Track, trackGetNext, trackGetOtherEnd } from "./track";
import { isNumber } from "lodash";
import { Switch } from "./switch";
import { Entity } from "../interfaces/entity";

export type Situation = {
    track: Track,
    remainingTrack: number,
    direction: number
}

export type SituationSave = {
    trackId: number,
    position: number
}

export function advanceSituation(entities: Entity[], situation: Situation, movement: number) {
    const currentTrack = situation.track;

    const fitsInsideCurrentTrack = (situation.remainingTrack > movement);

    if(fitsInsideCurrentTrack) {
        situation.remainingTrack = situation.remainingTrack - movement;
        return;
    }
    //Else we're advancing onto another track

    // TODO Handle very short pieces of track
    const overFlowRoom = movement - situation.remainingTrack;

    
    const nextTrack = trackGetNext(entities, currentTrack);

    if(!nextTrack) {
        alert("Train crashed!");
        return;
        // TODO Handle nicer
    }

    situation.track = nextTrack;
    situation.direction = trackGetOtherEnd(nextTrack, situation.direction).id;
    situation.remainingTrack = nextTrack.length - overFlowRoom;
}

export function createSituation(track: Track, remainingTrack: number, direction: number): Situation {
    return {
        remainingTrack,  track, direction
    }
}

export function situationRoomBehind(situation: Situation) {
    return situation.track.length - situation.remainingTrack;
}
export function isSituationSave(any: any): any is SituationSave {
    return isNumber(any.trackId) && isNumber(any.remainingTrack);
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