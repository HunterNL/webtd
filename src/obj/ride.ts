import { Train, isTrain, trainGetLength } from "./train";
import { TrackPosition, SituationSave, advanceAlongTrack, DirectionalTrackPosition, isSituationSave, situationRoomBehind, DIRECTION_FORWARD, DIRECTION_BACKWARD, Direction } from "./situation";
import { Track, isTrack, trackGetOtherEnd } from "./track";
import { Entity, getEntityById } from "../interfaces/entity";
import { isNumber, noop } from "lodash";
import { resolveBoundry } from "./switch";
import { TrackSpan } from "./trackSpan";

export interface Ride extends Entity {
    direction: number;
    position: TrackPosition;
    train: Train,
    span: TrackSpan;
    speed: number,
}

export type RideSave = Entity & {
    trainId: number,
    speed: number
}

function createTrainSpan(entities: Entity[], forwardPosition: TrackPosition, length: number, forwardDirection: Direction): TrackSpan {
    return advanceAlongTrack(entities, forwardPosition, length * forwardDirection * -1);
}

export function updateRide(entities: Entity[],ride: Ride,dt:number) {
    const speed = 40;

    // Figure out where the front of the train ends up
    const trainMovement = advanceAlongTrack(entities, ride.position, speed * ride.direction);
    const newForwardPosition = trainMovement.endPosition;

    // #TODO MULTI TRACK DRIFTING
    // Could figure out the postion of every bogey and do this check individualy, break connections if track differs

    // Run backwards from the front to figure out where the rest of the train ends up
    // const trainSpan = advanceAlongTrack(entities, newForwardPosition, ride.train.length * trainMovement.finalDirection * -1) // -1, we're looking backwards
    const trainSpan = createTrainSpan(entities, newForwardPosition, ride.train.length, trainMovement.finalDirection);


    // Todo: Simpify into a single span with proper direction
    ride.position = newForwardPosition;
    ride.direction = trainMovement.finalDirection;
    ride.span = trainSpan;

    console.log(ride);

}

export function rideCreate(train: Train, span: TrackSpan, speed: number,id: number, direction: Direction, position: TrackPosition): Ride {
    return {
        id,
        type: "ride",
        train,
        span,
        speed,
        direction,
        position,
    }
}

export function isRideSave(ridesave: any): ridesave is RideSave {
    return isNumber(ridesave.trainId) && isNumber(ridesave.speed) && isSituationSave(ridesave.position)
}

export function loadRide(entities: Entity[], rideSave: any): Ride {
    const train = getEntityById(entities, rideSave.trainId, isTrain);
    const track = getEntityById(entities,rideSave.position.trackId, isTrack);

    const position : TrackPosition = {
        offset: rideSave.position.offset,
        track
    }

    return {
        id: rideSave.id,
        position,
        span: createTrainSpan(entities, position, train.length, rideSave.direction),
        speed: rideSave.speed,
        train,
        type: "ride",
        direction: rideSave.direction
    }
}


// export function rideOccupiesTrack(ride: Ride, track: Track): boolean {
//     return ride.situation.track.id === track.id;
// }

export function isRide(any: any): any is Ride {
    return (isTrain(any.train) && typeof any.speed === "number");
}

// Todo: Proper support for spanning multiple tracks
// export function getSpanningTracks(entities: Entity[], ride: Ride): Track[] {
    

//     const currentPosition = ride.situation
//     const currentTrack = currentPosition.track;
//     const trainLength = trainGetLength(ride.train);

//     const returnTracks = [currentTrack]

//     const seeker : TrackPosition = {
//         offset: currentPosition.offset,
//         track: currentPosition.track
//     }

//     advanceAlongTrack(entities,seeker, currentPosition.facingForward ? -trainLength : trainLength);

//     const tailTrack = seeker.track;

//     if(tailTrack.id !== currentTrack.id) {
//         returnTracks.push(tailTrack);
//     }


//     return returnTracks;
    
//     // let currentTrack = ride.situation.track;
//     // let facingForward = ride.situation.facingForward;

//     // let boundryBehind = (facingForward ? currentTrack.boundries[0] : currentTrack.boundries[1]);

//     // let currentBackDirection = trackGetOtherEnd(currentTrack, (facingForward ? DIRECTION_FORWARD : DIRECTION_BACKWARD));
//     // let trackBehind = situationRoomBehind(ride.situation)
//     // let underFlow = trackBehind - trainLength;
//     // let tempTrackId : number | undefined;
//     // returnTracks.push(currentTrack);


//     // if(underFlow < 0) {
//     //     const trackBehindId = resolveBoundry(currentTrack,currentBackDirection);
//     //     if(typeof trackBehindId === "undefined") {
//     //         throw new Error("Train crashed");
//     //     }
//     //     const behindTrack = getEntityById(entities,trackBehindId,isTrack);
//     //     returnTracks.push(behindTrack);
//     // }

//     // while(underFlow > 0) {
//     //     currentBackDirection = trackGetOtherEnd(currentTrack, currentForwardDirection);

//     //     tempTrackId = resolveBoundry(currentTrack, currentBackDirection);
//     //     if(!tempTrackId) throw new Error("Train crashed");
//     //     currentTrack = getEntityById(entities,tempTrackId,isTrack);
//     //     currentForwardDirection = currentBackDirection.id;
//     //     trackBehind = situationRoomBehind({direction: currentForwardDirection,remainingTrack:0,track:currentTrack})


//     // }

//     return returnTracks;

// }