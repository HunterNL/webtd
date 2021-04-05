import { Entity } from "../interfaces/entity";
import { Identifiable, isIdentifiable } from "../interfaces/id";
import { isLengthable, Lengthable } from "../interfaces/lengthable";

export type Train = Identifiable & Lengthable & Entity;

export function createTrain(id: number, length: number): Train {
    return {
        id,
        length,
        type: "train"
    }
}

export function isTrain(unknown: unknown): unknown is Train {
    return isIdentifiable(unknown) && isLengthable(unknown);
}

// export function trainGetLength(train: Train): number {
//     return 200 //m
// }

// export function trainGetTopSpeed(train: Train): number {
//     return 38.8; // m/s
// }

// Source: https://community.ns.nl/in-de-trein-11/wat-is-de-versnelling-van-een-intercity-6652
export function trainGetAccelleration(): number {
    // 0,46 for an NS sprinter
    // 0,36 for high speed (to 200kmh)
    // Intercity Direct is capped at 0,5ms/s

    return 0.35 // ms^2 ///
}

/* 
Maximum/emergency Braking force reference
IC: 0,66 m/s2
Sprinter: 0,8 m/s2
Goederen: 0,31 m/s2 (goods)


Realistic braking force
IC: 0,5 m/s2
Sprinter: 0,6 m/s2
Goederen: 0,31 m/s2
.
*/

// export function trainGetDecelleration(train: Train): number {
//     return 0.8; //ms^2
// }
