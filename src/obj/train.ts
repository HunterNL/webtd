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
// export function trainGetAccelleration(train: Train): number {
//     return 1.0 // ms^2
// }

// export function trainGetDecelleration(train: Train): number {
//     return 0.8; //ms^2
// }
