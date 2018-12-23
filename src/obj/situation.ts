import { Identifier } from "../interfaces/id";
import { Track } from "./track";

export type Situation = {
    track: Track,
    position: number,
}

export function createSituation(track: Track, position: number): Situation {
    return {
        position,  track
    }
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