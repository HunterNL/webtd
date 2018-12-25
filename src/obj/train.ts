import { Identifiable, isIdentifiable } from "../interfaces/id";
import { Carset, isCarSet } from "./carset";
import { Lengthable, isLengthable, sumLenghts } from "../interfaces/lengthable";
import { Entity } from "../interfaces/entity";
import { Track } from "./track";

export type Train = Identifiable & Lengthable & Entity & {
    carsets: Carset[];
}

export function createTrain(id: number, carsets: Carset[]): Train {
    return {
        carsets,
        id,
        length: sumLenghts(carsets),
        type: "train"
    }
}

export function isTrain(any: any): any is Train {
    return isIdentifiable(any) && isLengthable(any) && Array.isArray((<any>any).carsets) &&(<any>any).carsets.every(isCarSet);
}

export function trainGetLength(train: Train) {
    return 200 //m
}

export function trainGetTopSpeed(train: Train) {
    return 38.8; // m/s
}
export function trainGetAccelleration(train: Train) {
    return 1.0 // ms^2
}

export function trainGetDecelleration(train: Train) {
    return 0.8; //ms^2
}
