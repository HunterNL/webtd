import { Identifiable, Identifier } from "./id";
import equals from "ramda/es/equals";
import propIs from "ramda/es/propIs";
import { isObject } from "../util/isObject";

export type EntityType = "train" | "track" | "end" | "switch" | "ride";

export type Entity = Identifiable & {
    type: EntityType
}

export function isEntity(a: any): a is Entity {
    return isObject(a) && (typeof (a as any).type === "string");
}

export function getEntityById<T>(entities: Entity[], id: Identifier, guard: (a: any) => a is T): T { 
    const ent = entities.find(ent => ent.id === id);
    if(!ent) {
        throw new Error("Entity not found!");
    }

    if(!guard(ent)) {
        throw new Error("Entity is of the wrong type!")
    }

    return ent;
}