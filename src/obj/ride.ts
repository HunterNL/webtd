import { Train } from "./train";
import { Situation } from "./situation";
import { Track } from "./track";

type Ride = {
    train: Train,
    situation: Situation
}

export function rideCreate(train: Train,initialSituation: Situation) {
    return {
        train,
        situation: initialSituation
    }
}


export function rideOccupiesTrack(ride: Ride, track: Track) {
    return ride.situation.track.id === track.id;
}