import { clamp, head } from "lodash";
import { Entity } from "../interfaces/entity";
import { stoppingDistance } from "../util/physics";
import { Ride } from "./ride";
import { Signal } from "./signal";
import { getDistanceToPosition, TrackPosition } from "./situation";
import { trainGetAccelleration } from "./train";

const SIGNAL_STOP_AHEAD_DISTANCE = 15// m, for a big "hoofdsein", 10 meter for a small dwarfsignal

export type Driveable = {
    driverMode: DriverMode;
}

// Playing around with 
export function hasDriver<T extends {driverMode?: any}>(any: T): any is T & Driveable {
    return typeof any.driverMode !== "undefined";
}

export type DriverMode = DriverModeMaintainSpeed | DriverModeStopAt

export type DriverModeMaintainSpeed = {
    type: "maintain_speed",
    targetSpeed: number
}

export type DriverModeStopAt =  {
    type: "stop_at",
    stopPosition: TrackPosition
}

// This function awkwardly conditionally does or doesn't return existing objects 
export function observeSignals(ride: Ride & Driveable, signals: Signal[]): DriverMode {
    const firstSignal = head(signals);

    if(!firstSignal) {
        return ride.driverMode
    }

    return {
        type: "stop_at",
        stopPosition: {
            track: firstSignal.position.track,
            offset: firstSignal.position.offset - SIGNAL_STOP_AHEAD_DISTANCE // TODO Signal facing & reverse track compat
        }
    }
}

/**
 * Actually drive the train, choo choo!
 * Should return a dt-corrected requested acceleration
 * @param entities Array of all entities
 * @param ride The ride itself
 * @param dt Delta time
 */
export function driveTrain(entities: Entity[], ride: Ride & Driveable, dt: number) : number {
    const {driverMode, speed} = ride;
    const accelerationCapability = trainGetAccelleration();

    // Todo proper multiple modes
    if(driverMode.type === "maintain_speed") {
        

        const speedDifference = clamp(driverMode.targetSpeed - speed, -accelerationCapability, accelerationCapability);

        return speedDifference * dt;
    }

    if(driverMode.type === "stop_at") {
        const ACCELERATION_MARGIN = 0.75; // Asume less braking/accel force than available 
        const acceleration = trainGetAccelleration() * ACCELERATION_MARGIN;

        const trainStoppingDistance = stoppingDistance(speed, acceleration);
        const remainingDistance = getDistanceToPosition(ride.position,driverMode.stopPosition, 1 as any);

        console.log("Remaining distance:" + remainingDistance + " Speed: " + ride.speed);

        if (remainingDistance < 0.1) {
            return Math.max(0, -acceleration); // We're so close, just slam on the brakes
        }

        if(trainStoppingDistance > remainingDistance) {
            return -accelerationCapability; // Reduce to remain under the max decel curve
        } else {
            return 0; // Maintain speed
        }
    }

    throw new Error("Unknown drivermode");
}