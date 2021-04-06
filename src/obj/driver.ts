import { clamp } from "lodash";
import { Entity } from "../interfaces/entity";
import { Ride } from "./ride";
import { trainGetAccelleration } from "./train";

export type Driveable = {
    driverMode: DriverMode;
}

// Playing around with 
export function hasDriver<T extends {driverMode?: any}>(any: T): any is T & Driveable {
    return typeof any.driverMode !== "undefined";
}

export type DriverMode = DriverModeMaintainSpeed

export type DriverModeMaintainSpeed = {
    type: "maintain_speed",
    targetSpeed: number
}

export type Driver = {
    train: number,
    targetSpeed: number
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

    // Todo proper multiple modes
    if(driverMode.type !== "maintain_speed") {
        return 0;
    }

    const accelerationCapability = trainGetAccelleration();

    const speedDifference = clamp(driverMode.targetSpeed - speed, -accelerationCapability, accelerationCapability);

    return speedDifference * dt;
}