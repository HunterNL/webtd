import { Train, isTrain, trainGetLength } from "./train";
import { TrackPosition, SituationSave, advanceAlongTrack, DirectionalTrackPosition, isSituationSave, situationRoomBehind, DIRECTION_FORWARD, DIRECTION_BACKWARD } from "./situation";
import { Track, isTrack, trackGetOtherEnd } from "./track";
import { Entity, getEntityById } from "../interfaces/entity";
import { isNumber, noop } from "lodash";
import { resolveBoundry } from "./switch";

export interface Ride extends Entity {
    train: Train,
    situation: DirectionalTrackPosition,
    speed: number,
}

export type RideSave = Entity & {
    trainId: number,
    situation: SituationSave,
    speed: number
}

export function updateRide(entities: Entity[],ride: Ride,dt:number) {
    advanceAlongTrack(entities, ride.situation, 100)
}

export function rideCreate(train: Train,initialSituation: DirectionalTrackPosition, speed: number,id: number): Ride {
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

    console.log("Loading ride")
    return {
        id: rideSave.id,
        situation: {
            offset: rideSave.situation.offset,
            track: getEntityById(entities, rideSave.situation.trackId, isTrack),
            facingForward: rideSave.situation.facingFoward
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

// Todo: Proper support for spanning multiple tracks
export function getSpanningTracks(entities: Entity[], ride: Ride): Track[] {
    

    const currentPosition = ride.situation
    const currentTrack = currentPosition.track;
    const trainLength = trainGetLength(ride.train);

    const returnTracks = [currentTrack]

    const seeker : TrackPosition = {
        offset: currentPosition.offset,
        track: currentPosition.track
    }

    advanceAlongTrack(entities,seeker, currentPosition.facingForward ? -trainLength : trainLength);

    const tailTrack = seeker.track;

    if(tailTrack.id !== currentTrack.id) {
        returnTracks.push(tailTrack);
    }


    return returnTracks;
    
    // let currentTrack = ride.situation.track;
    // let facingForward = ride.situation.facingForward;

    // let boundryBehind = (facingForward ? currentTrack.boundries[0] : currentTrack.boundries[1]);

    // let currentBackDirection = trackGetOtherEnd(currentTrack, (facingForward ? DIRECTION_FORWARD : DIRECTION_BACKWARD));
    // let trackBehind = situationRoomBehind(ride.situation)
    // let underFlow = trackBehind - trainLength;
    // let tempTrackId : number | undefined;
    // returnTracks.push(currentTrack);


    // if(underFlow < 0) {
    //     const trackBehindId = resolveBoundry(currentTrack,currentBackDirection);
    //     if(typeof trackBehindId === "undefined") {
    //         throw new Error("Train crashed");
    //     }
    //     const behindTrack = getEntityById(entities,trackBehindId,isTrack);
    //     returnTracks.push(behindTrack);
    // }

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