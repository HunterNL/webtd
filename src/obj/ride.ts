import { Train, isTrain } from "./train";
import { Situation } from "./situation";
import { Track } from "./track";
import { Entity } from "../interfaces/entity";

export type Ride = Entity & {
    train: Train,
    situation: Situation,
    speed: number,
}

export function rideCreate(train: Train,initialSituation: Situation, speed: number,id: number): Ride {
    return {
        id,
        type: "ride",
        train,
        situation: initialSituation,
        speed
    }
}


export function rideOccupiesTrack(ride: Ride, track: Track): boolean {
    return ride.situation.track.id === track.id;
}

export function isRide(any: any): any is Ride {
    return (isTrain(any.train) && typeof any.speed === "number");
}