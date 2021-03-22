import { Entity, getEntityById } from "../interfaces/entity";
import { Identifier, isIdentifier, isIdentifiable, Identifiable } from "../interfaces/id";
import { Junction, isJunction } from "./junction";
import { Buffer, isBuffer } from "./buffer";
import equals from "ramda/es/equals";
import { Track, isTrack } from "./track";

const SWITCH_ACTUATION_TIME = 3; //seconds

export function eq<T>(a: T) {
    return function(b: T): boolean {
        return a === b;
    }
}

export type TrackBoundry = TrackSwitch | Buffer;

export enum SwitchState {
    Straight,
    Side,
    TransitToStraight,
    TransitToSide,
    Faulty
}

export function isTrackBoundry(any: Entity): any is TrackBoundry {
    return any.type === "switch" || any.type === "end";
}

export interface TrackSwitch extends Entity {
    type: "switch",
    targetState: SwitchState.Straight | SwitchState.Side,
    currentState: SwitchState,
    actuationStartTime: Date,
    junction: Junction
}

export function loadSwitch({id,junction} : {id:any,junction:any}): TrackSwitch {
    if(!isIdentifier(id)) throw new Error();
    if(!isJunction(junction)) throw new Error();

    return createSwitch(id, junction);
}

export function createSwitch(id: Identifier, junction: Junction): TrackSwitch {
    return {
        id,
        type: "switch",
        targetState: SwitchState.Straight,
        currentState: SwitchState.Straight,
        actuationStartTime: new Date(),
        junction,
    }
}

export function isSwitch(a: any): a is TrackSwitch  {
    return isIdentifiable(a) &&
        (a as any).type === "switch";
}

export function switchGetActivePaths(swi: TrackSwitch): Array<[Identifier,Identifier]> {
    if(swi.currentState === SwitchState.Straight) {
        return swi.junction.straightConnections
    }

    if(swi.currentState === SwitchState.Side) {
        return swi.junction.sideConnections
    }

    throw new Error("Unknown switch state");
}   

export function getPathTroughSwitch(swi: TrackSwitch, trackId: Identifier): Identifier | undefined {
    const paths = switchGetActivePaths(swi);
    const pathForTrack = paths.find(set => set.includes(trackId));
    if(!pathForTrack) return;

    return pathForTrack.find(id => id !== trackId);

}

export function resolveBoundry(track: Track, boundry: TrackBoundry): number | undefined {
    if(isBuffer(boundry)) return;

    return getPathTroughSwitch(boundry, track.id);
}