import { Train, isTrain, trainGetLength } from "./train";
import { Situation, SituationSave, isSituationSave, advanceSituation, situationRoomBehind } from "./situation";
import { Track, isTrack, trackGetOtherEnd } from "./track";
import { Entity, getEntityById } from "../interfaces/entity";
import { isNumber, noop } from "lodash";
import { resolveBoundry } from "./switch";

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
            remainingTrack: rideSave.situation.remainingTrack,
            track: getEntityById(entities, rideSave.situation.trackId, isTrack),
            direction: rideSave.situation.direction
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

export function getSpanningTracks(entities: Entity[], ride: Ride): Track[] {
    const returnTracks = [];
    const trainLength = trainGetLength(ride.train);

    let currentTrack = ride.situation.track;
    let currentForwardDirection = ride.situation.direction;
    let currentBackDirection = trackGetOtherEnd(currentTrack, currentForwardDirection)
    let trackBehind = situationRoomBehind(ride.situation)
    let underFlow = trackBehind - trainLength;
    let tempTrackId : number | undefined;
    returnTracks.push(currentTrack);


    if(underFlow < 0) {
        const trackBehindId = resolveBoundry(currentTrack,currentBackDirection);
        if(typeof trackBehindId === "undefined") {
            throw new Error("Train crashed");
        }
        const behindTrack = getEntityById(entities,trackBehindId,isTrack);
        returnTracks.push(behindTrack);
    }

    // while(underFlow > 0) {
    //     currentBackDirection = trackGetOtherEnd(currentTrack, currentForwardDirection);

    //     tempTrackId = resolveBoundry(currentTrack, currentBackDirection);
    //     if(!tempTrackId) throw new Error("Train crashed");
    //     currentTrack = getEntityById(entities,tempTrackId,isTrack);
    //     currentForwardDirection = currentBackDirection.id;
    //     trackBehind = situationRoomBehind({direction: currentForwardDirection,remainingTrack:0,track:currentTrack})


    // }

    return returnTracks;

}