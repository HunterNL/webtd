import { flatten, uniq } from "lodash";
import { Entity, getEntityById } from "../interfaces/entity";
import { Identifier, isIdentifiable, isIdentifier } from "../interfaces/id";
import { Buffer, isBuffer } from "./buffer";
import { isJunction, Junction } from "./junction";
import { isTrack, Track, trackGetOtherEnd } from "./track";

// const SWITCH_ACTUATION_TIME = 3; //seconds

export function eq<T>(a: T) {
    return function(b: T): boolean {
        return a === b;
    }
}

export type TrackBoundary = TrackSwitch | Buffer;

export enum SwitchState {
    Straight,
    Side,
    TransitToStraight,
    TransitToSide,
    Faulty
}

export function isTrackBoundary(any: Entity): any is TrackBoundary {
    return any.type === "switch" || any.type === "end";
}

export interface TrackSwitch extends Entity {
    type: "switch",
    //targetState: SwitchState.Straight | SwitchState.Side,
    currentState: SwitchState,
    //actuationStartTime: Date,
    junction: Junction
}

export function loadSwitch({id,junction, renderData} : {id:any,junction:any, renderData?: any}): TrackSwitch {
    if(!isIdentifier(id)) throw new Error();
    if(!isJunction(junction)) throw new Error();

    return createSwitch(id, junction, renderData);
}

export function createSwitch(id: Identifier, junction: Junction, renderData: any): TrackSwitch {
    return {
        id,
        type: "switch",
        // targetState: SwitchState.Straight,
        currentState: SwitchState.Straight,
        // actuationStartTime: new Date(),
        junction,
        renderData
    }
}

export function isSwitch(a: any): a is TrackSwitch  {
    return isIdentifiable(a) &&
        (a as any).type === "switch";
}

export function switchGetPathForState(swi: TrackSwitch, switchState: SwitchState): [number, number][] {
    if(switchState === SwitchState.Straight) {
        return swi.junction.straightConnections
    }

    if(switchState === SwitchState.Side) {
        return swi.junction.sideConnections
    }

    throw new Error("Unknown switch state");
}

export function switchGetActivePaths(swi: TrackSwitch): Array<[Identifier,Identifier]> {
    return switchGetPathForState(swi, swi.currentState)
}   

export function switchGetAjoiningTrackIds(swi: TrackSwitch): Identifier[] {
    return uniq(flatten(swi.junction.sideConnections.concat(swi.junction.straightConnections)));
}

export function switchGetRemoteBoundaries(swi: TrackSwitch, entities: Entity[]) {
    const ajoiningTracks = switchGetAjoiningTrackIds(swi)
        .map(id => getEntityById(entities, id, isTrack));
    return ajoiningTracks.map(track => trackGetOtherEnd(track, swi.id));
}

export function switchGetActiveRemoteBoundaries(swi: TrackSwitch, entities: Entity[]) {
    const ajoiningTracks = uniq(flatten(switchGetActivePaths(swi)))
        .map(id => getEntityById(entities, id, isTrack));
    return ajoiningTracks.map(track => trackGetOtherEnd(track, swi.id));
}

export function throwSwitch(trackSwitch: TrackSwitch) {
    if(trackSwitch.currentState === SwitchState.Straight) {
        trackSwitch.currentState = SwitchState.Side;
        return
    }

    if(trackSwitch.currentState == SwitchState.Side) {
        trackSwitch.currentState = SwitchState.Straight;
        return
    }

    throw new Error("Tried to throw switch in unknown state");
}

export function getPathTroughSwitch(swi: TrackSwitch, trackId: Identifier): Identifier | undefined {
    const paths = switchGetActivePaths(swi);
    const pathForTrack = paths.find(set => set.includes(trackId));
    if(!pathForTrack) return;

    return pathForTrack.find(id => id !== trackId);

}

export function resolveBoundary(track: Track, boundary: TrackBoundary): number | undefined {
    if(isBuffer(boundary)) return;

    return getPathTroughSwitch(boundary, track.id);
}