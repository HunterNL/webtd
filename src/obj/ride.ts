import { clamp, isNumber } from "lodash";
import { Entity, getEntityById } from "../interfaces/entity";
import { advanceAlongTrack, Direction, isSituationSave, TrackPosition } from "./situation";
import { isTrack } from "./track";
import { TrackSpan } from "./trackSpan";
import { isTrain, Train, trainGetAccelleration } from "./train";

export interface Ride extends Entity {
    direction: number;
    position: TrackPosition;
    train: Train,
    span: TrackSpan;
    speed: number,
    targetSpeed: number
}

export type RideSave = Entity & {
    trainId: number,
    speed: number
}

export function createTrainSpan(entities: Entity[], forwardPosition: TrackPosition, length: number, forwardDirection: Direction): TrackSpan {
    return advanceAlongTrack(entities, forwardPosition, length * forwardDirection * -1);
}

export function updateRide(entities: Entity[],ride: Ride, dt:number): void {
    const {speed, targetSpeed} = ride;
    const acceleration = trainGetAccelleration() * dt; // Change in speed allowed this tick

    if(speed !== targetSpeed) {
        applyRideAcceleration(targetSpeed, speed, acceleration, ride);
    }


    const movement = ride.speed * dt;

    if(movement !== 0 ) {
        applyRideMovement(entities, ride, movement);
    }
}

function applyRideAcceleration(targetSpeed: number, speed: number, acceleration: number, ride: Ride) {
    const speedDifference = clamp(targetSpeed - speed, -acceleration, acceleration);
    ride.speed = speed + speedDifference;
}

function applyRideMovement(entities: Entity[], ride: Ride, movement: number) {
    // Figure out where the front of the train ends up
    const trainMovement = advanceAlongTrack(entities, ride.position, movement * ride.direction);
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
}

export function rideCreate(train: Train, span: TrackSpan, speed: number,id: number, direction: Direction, position: TrackPosition, targetSpeed: number): Ride {
    return {
        id,
        type: "ride",
        train,
        span,
        speed,
        direction,
        position,
        targetSpeed
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
        direction: rideSave.direction,
        targetSpeed: 11.11
    }
}

export function isRide(any: any): any is Ride {
    return (isTrain(any.train) && typeof any.speed === "number");
}