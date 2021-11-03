import { Entity } from "../../interfaces/entity";
import { isIdentifiable } from "../../interfaces/id";
import { Saveable } from "../save";

export interface Buffer extends Entity {
    type: "end";
}

export type BufferSave = Saveable<Buffer>

export function createBuffer(id:number): Buffer {
    return {
        id,
        type: "end",
    }
}

export function isBuffer(any: any): any is Buffer {
    return isIdentifiable(any) && (any as any).type === "end"
}