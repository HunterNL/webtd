import { clamp, isNumber } from "lodash";
import { Entity, getEntityById } from "../interfaces/entity";
import { DriverMode, driveTrain, hasDriver, observeSignals } from "./driver";
import { lookupSignals } from "./signal";
import { advanceAlongTrack, Direction, isSituationSave, TrackPosition } from "./situation";
import { isTrack } from "./track";
import { TrackSpan } from "./trackSpan";
import { isTrain, Train, trainGetAccelleration } from "./train";

export interface Ride extends Entity{
    direction: number;
    position: TrackPosition;
    train: Train,
    span: TrackSpan;
    speed: number,
    driverMode?: DriverMode
}

export type RideSave = Entity & {
    trainId: number,
    speed: number
}

export function createTrainSpan(entities: Entity[], forwardPosition: TrackPosition, length: number, forwardDirection: Direction): TrackSpan {
    const [span, didComplete] = advanceAlongTrack(entities, forwardPosition, length * forwardDirection * -1);
    
    if(!didComplete) {
        throw new Error("Failed to create train span, train derailed?");
    }

    return span;
}




// Update the ride, calling the driver function if set
export function updateRide(entities: Entity[],ride: Ride, dt:number): void {
    const {speed} = ride;

    if(hasDriver(ride)) {
        const signals = lookupSignals(entities,ride,400);

        //Side effect
        ride.driverMode = observeSignals(ride,signals);
    }

    const acceleration = (hasDriver(ride) ? driveTrain(entities, ride, dt) : 0) // Note: This makes runaway trains possible(!)
    const maxAllowedAcceleration = trainGetAccelleration() * dt; // Change in speed allowed this tick

    // Don't allow the driver to exceed the train's physical capable acceleration
    const correctedAcceleration = clamp(acceleration,-maxAllowedAcceleration,maxAllowedAcceleration);


    // Side effect
    ride.speed = Math.max(speed + correctedAcceleration, 0); // Don't allow negative speed


    const movement = ride.speed * dt;

    if(movement !== 0 ) {
        moveRide(entities, ride, movement);
    }
}

// Physically move the ride
function moveRide(entities: Entity[], ride: Ride, movement: number) {
    // Figure out where the front of the train ends up
    const trainMovement = advanceAlongTrack(entities, ride.position, movement * ride.direction);
    const newForwardPosition = trainMovement[0].endPosition;

    // #TODO MULTI TRACK DRIFTING
    // Could figure out the postion of every bogey and do this check individualy, break connections if track differs
    // Run backwards from the front to figure out where the rest of the train ends up
    // const trainSpan = advanceAlongTrack(entities, newForwardPosition, ride.train.length * trainMovement.finalDirection * -1) // -1, we're looking backwards
    const trainSpan = createTrainSpan(entities, newForwardPosition, ride.train.length, trainMovement[0].finalDirection);


    // Todo: Simpify into a single span with proper direction
    ride.position = newForwardPosition;
    ride.direction = trainMovement[0].finalDirection;
    ride.span = trainSpan;
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
        direction: rideSave.direction,
        driverMode: rideSave.driverMode
    }
}

export function isRide(any: any): any is Ride {
    return (isTrain(any.train) && typeof any.speed === "number");
}

export function rideHasDriver(ride: Ride) {
    return typeof ride.driverMode !== "undefined";
}
