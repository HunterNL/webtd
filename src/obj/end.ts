import { Identifiable, isIdentifiable } from "../interfaces/id";
import { Entity } from "../interfaces/entity";

export type End = Entity;

export function createEnd(id:number) {
    return 
}

export function isEnd(any: any): any is End {
    return isIdentifiable(any) && (any as any).type === "end";
}