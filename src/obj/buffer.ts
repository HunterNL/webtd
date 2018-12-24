import { Identifiable, isIdentifiable } from "../interfaces/id";
import { Entity } from "../interfaces/entity";

export interface Buffer extends Entity {
    type: "end";
};

export function createEnd(id:number) {
    return 
}

export function isBuffer(any: any): any is Buffer {
    return isIdentifiable(any) && (any as any).type === "end"
}