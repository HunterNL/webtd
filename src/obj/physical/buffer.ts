import { Entity } from "../../interfaces/entity";
import { isIdentifiable } from "../../interfaces/id";

export interface Buffer extends Entity {
    type: "end";
}

export function createBuffer(id:number): Buffer {
    return {
        id,
        type: "end",
    }
}

export function isBuffer(any: any): any is Buffer {
    return isIdentifiable(any) && (any as any).type === "end"
}