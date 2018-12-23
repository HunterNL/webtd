import { Identifiable, isIdentifiable } from "../interfaces/id";
import { Entity } from "../interfaces/entity";

export type Buffer = Entity;

export function createEnd(id:number) {
    return 
}

export function isBuffer(any: any): any is Buffer {
    return isIdentifiable(any) && (any as any).type === "buffer";
}