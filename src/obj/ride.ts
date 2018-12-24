import { Train, isTrain } from "./train";
import { Situation, SituationSave, isSituationSave, advanceSituation } from "./situation";
import { Track, isTrack } from "./track";
import { Entity, getEntityById } from "../interfaces/entity";
import { isNumber, noop } from "lodash";

export interface Ride extends Entity {
    train: Train,
    situation: Situation,
    speed: number,
}

export type RideSave = Entity & {
    trainId: number,
    situation: SituationSave,
    speed: number
}

export function updateRide(entities: Entity[],ride: Ride,dt:number) {
    advanceSituation(entities, ride.situation, 100)
}

export function rideCreate(train: Train,initialSituation: Situation, speed: number,id: number): Ride {
    return {
        id,
        type: "ride",
        train,
        situation: initialSituation,
        speed,
    }
}

export function isRideSave(ridesave: any): ridesave is RideSave {
    return isNumber(ridesave.trainId) && isNumber(ridesave.speed) && isSituationSave(ridesave.situation)
}

export function loadRide(entities: Entity[], rideSave: any): Ride {

    console.log("LAODRIDE")
    return {
        id: rideSave.id,
        situation: {
            position: rideSave.situation.position,
            track: getEntityById(entities, rideSave.situation.trackId, isTrack),
        },
        speed: rideSave.speed,
        train: getEntityById(entities, rideSave.trainId, isTrain),
        type: "ride"
    }
}


export function rideOccupiesTrack(ride: Ride, track: Track): boolean {
    return ride.situation.track.id === track.id;
}

export function isRide(any: any): any is Ride {
    return (isTrain(any.train) && typeof any.speed === "number");
}