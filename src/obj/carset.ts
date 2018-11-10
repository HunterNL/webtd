import { Identifiable, Identifier, isIdentifiable } from "../interfaces/id";
import { Car, isCar } from "./car";
import { sumLenghts, isLengthable } from "../interfaces/lengthable";



export type Carset = Identifiable & {
    cars: Car[],
    length: number
}


export function createCarSet(id: Identifier, cars: Car[]): Carset {
    return {
        id,
        cars,
        length: sumLenghts(cars)
    }
}

export function isCarSet(any: any) : any is Carset {
    return isIdentifiable(any) && isLengthable(any) && Array.isArray((any as any).cars) && (any as any).cars.every(isCar);
}