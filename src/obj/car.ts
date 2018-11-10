import { Lengthable, isLengthable } from "../interfaces/lengthable";

export type Car = Lengthable;

export function createCar(length: number): Car {
    return {
        length
    }
}
export function isCar(obj: any): obj is Car {
    return isLengthable(obj)
}