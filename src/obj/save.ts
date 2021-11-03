import { Identifiable, Identifier } from "../interfaces/id"
import { BufferSave } from "./physical/buffer"
import { RideSave } from "./physical/ride"
import { SignalSave } from "./physical/signal"
import { TrackSwitchSave } from "./physical/switch"
import { TrackSave } from "./physical/track"
import { TrainSave } from "./physical/train"

type MapFile = {
    entities: EntitySave[]
    [key: string] : any
}

export type Saveable<T> = convertProperties<T>

type SaveableProperty<T> = T extends Identifiable ? Identifier : convertProperties<T>

type convertProperties<T> = {
    [K in keyof T]: (
        T[K] extends Identifiable ? Identifier :
        T[K] extends any[] ? SaveableProperty<T[K]> : 
        T[K] extends object ? SaveableProperty<T[K]> :
        T[K]
    )
}

export type EntitySave = TrackSave | TrackSwitchSave | BufferSave | RideSave | SignalSave | TrainSave