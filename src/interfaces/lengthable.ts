import { sumBy } from "../util/sumby";

export interface Lengthable {
    length: number
}

export function getLength(len: Lengthable): number {
    return len.length;
}

export function sumLenghts(r: Lengthable[]): number {
    return sumBy(getLength, r);
}

export function isLengthable(obj: any): obj is Lengthable {
    return !!obj && (typeof obj.length === "number");
}