import { Identifier } from "../interfaces/id";
import { Track } from "./track";

export type Situation = {
    speed: number,
    track: Track,
    position: number,
}

export function createSituation(track: Track, position: number,speed: number): Situation {
    return {
        position, speed, track
    }
}