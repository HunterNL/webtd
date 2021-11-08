// @ts-nochec
import { clamp, isNumber } from "lodash";
import { Entity, getEntityById } from "../../interfaces/entity";
import { DriverMode, driveTrain, hasDriver, observeSignals } from "./driver";
import { lookupSignals } from "../physical/signal";
import { TrackSpan } from "../trackSpan";
import { isTrack } from "./track";
import { isTrain, Train, trainGetAccelleration } from "./train";
import { TrackPosition, Direction, advanceAlongTrack, isSituationSave, getDirectionForMovement } from "./situation";

export interface Ride extends Entity{
    // direction: number;
    reversing: boolean,
    // position: TrackPosition;
    train: Train,
    span: TrackSpan; //Contains train positions, start/end by physical carriage position
    speed: number,
    driverMode?: DriverMode
    label?: string
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
    
    span.finalDirection = forwardDirection

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
// Movement is relative to current driving direction
export function moveRide(entities: Entity[], ride: Ride, movement: number) {
    // Figure out where the front of the train ends up
    const oldDrivingPosition = rideGetDrivingPosition(ride)
    const trainMovement = advanceAlongTrack(entities, oldDrivingPosition, movement * ride.span.finalDirection);
    const newForwardPosition = trainMovement[0].endPosition;

    // #TODO MULTI TRACK DRIFTING
    // Could figure out the postion of every bogey and do this check individualy, break connections if track differs
    // Run backwards from the front to figure out where the rest of the train ends up
    // const trainSpan = advanceAlongTrack(entities, newForwardPosition, ride.train.length * trainMovement.finalDirection * -1) // -1, we're looking backwards
    const trainSpan = createTrainSpan(entities, newForwardPosition, ride.train.length, trainMovement[0].finalDirection * getDirectionForMovement(movement) as Direction);


    // Todo: Simpify into a single span with proper direction
    // ride.position = newForwardPosition;
    // ride.direction = trainMovement[0].finalDirection;
    ride.span = trainSpan;
}

export function rideCreate(train: Train, span: TrackSpan, speed: number,id: number, direction: Direction, position: TrackPosition): Ride {
    return {
        id,
        type: "ride",
        train,
        span,
        speed,
        reversing: false
        // direction,
        // position,
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
        span: createTrainSpan(entities, position, train.length, rideSave.direction),
        speed: rideSave.speed,
        train,
        type: "ride",
        driverMode: rideSave.driverMode,
        reversing: false,
        label: rideSave.label
    }
}

export function isRide(any: any): any is Ride {
    return (isTrain(any.train) && typeof any.speed === "number");
}

export function rideHasDriver(ride: Ride) {
    return typeof ride.driverMode !== "undefined";
}

export function rideReverse(ride: Ride) {

}

export function rideGetDrivingPosition(ride: Ride): TrackPosition { // Not the physical cab position, but whatever side would be facing the current driving direction
    if(ride.reversing) {
        return ride.span.endPosition
    } else {
        return ride.span.startPosition
    }
}