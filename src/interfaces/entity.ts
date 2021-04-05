import { Ride } from "../obj/ride";
import { Signal } from "../obj/signal";
import { TrackSwitch } from "../obj/switch";
import { Track } from "../obj/track";
import { Train } from "../obj/train";
import { isObject } from "../util/isObject";
import { Identifiable, Identifier } from "./id";

// export type EntityType = "train" | "track" | "end" | "switch" | "ride";

interface EntityTypeMap {
    "train" : Train,
    "track" : Track,
    "end" : Buffer,
    "switch" : TrackSwitch,
    "ride" : Ride,
    "signal" : Signal
}

export type EntityType = keyof EntityTypeMap;

export type Entity = Identifiable & {
    type: EntityType;
    renderData?: any
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