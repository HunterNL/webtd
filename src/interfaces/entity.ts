import { Identifiable } from "./id";

export type EntityType = "train" | "track" | "end";

export type Entity = Identifiable & {
    type: EntityType
}