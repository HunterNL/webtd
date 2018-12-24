import { Identifier } from "../interfaces/id";
import { Track, trackGetNext } from "./track";
import { isNumber } from "lodash";
import { Switch } from "./switch";
import { Entity } from "../interfaces/entity";

export type Situation = {
    track: Track,
    position: number,
}

export type SituationSave = {
    trackId: number,
    position: number
}

export function advanceSituation(entities: Entity[], situation: Situation, movement: number) {
    const currentTrack = situation.track;

    const fitsInsideCurrentTrack = (situation.position + movement) < currentTrack.length

    if(fitsInsideCurrentTrack) {
        situation.position = situation.position + movement;
        return;
    }

    const roomLeftOnCurrentTrack = currentTrack.length - situation.position;
    const overFlowRoom = movement - roomLeftOnCurrentTrack;

    //Else' we're advancing onto another track
    const nextTrack = trackGetNext(entities, currentTrack);

    if(!nextTrack) {
        alert("Train crashed!");
        return;
        // TODO Handle nicer
    }

    situation.track = nextTrack;
    situation.position = overFlowRoom
}

export function createSituation(track: Track, position: number): Situation {
    return {
        position,  track
    }
}

export function isSituationSave(any: any): any is SituationSave {
    return isNumber(any.trackId) && isNumber(any.position);
}

export function situationIsValidForLength(situation: Situation, length: number): boolean {
    const track = situation.track;
    const position = situation.position;
    const trackLength = track.length;

    if(position>trackLength) {
        return false; // Train front exceeds track length
    }

    if(position-length<0) {
        return false; // Train escapes end
    }

    return true;
}