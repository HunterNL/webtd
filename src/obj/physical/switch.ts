import { flatten, uniq, xor } from "lodash";
import { Entity, getEntityById } from "../../interfaces/entity";
import { Identifier, isIdentifiable, isIdentifier } from "../../interfaces/id";
import { Saveable } from "../save";
import { Buffer, isBuffer } from "./buffer";
import { isJunction, Junction } from "./junction";
import { isTrack, Track, trackGetDetectionSegmentAjoiningBoundary, trackGetOtherEnd } from "./track";
import { TrackSegment } from "./trackSegment";

// const SWITCH_ACTUATION_TIME = 3; //second

export function eq<T>(a: T) {
    return function(b: T): boolean {
        return a === b;
    }
}

export type TrackBoundary = TrackSwitch | Buffer;

export type TrackBoundaryRenderData = {
    position: [number,number]
}

export enum SwitchState {
    Straight,
    Side,
    TransitToStraight,
    TransitToSide,
    Faulty
}

export type TrackSwitchSave = Saveable<TrackSwitch>

export function isTrackBoundary(any: Entity): any is TrackBoundary {
    return any.type === "switch" || any.type === "end";
}

export interface TrackSwitch extends Entity {
    type: "switch",
    //targetState: SwitchState.Straight | SwitchState.Side,
    currentState: SwitchState,
    //actuationStartTime: Date,
    junction: Junction,
    renderData?: {
        position: [number, number]
    }
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

export function switchGetAjoiningDetectionSegments(swi: TrackSwitch, tracks: Track[]): TrackSegment[] {
    const ajoiningTracks = switchGetAjoiningTrackIds(swi).map(id => getEntityById(tracks,id,isTrack));
    return ajoiningTracks.map(track => trackGetDetectionSegmentAjoiningBoundary(track, swi.id));
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

export function switchSetState(trackSwitch: TrackSwitch, switchState: SwitchState) {
    trackSwitch.currentState = switchState
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

// Given a trackId and switch, return all possible destination tracks
export function switchGetPossiblePaths(junction: Junction, trackId: Identifier): Identifier[] {
    const allConnections = ([] as [Identifier,Identifier][]).concat(junction.straightConnections,junction.sideConnections);

    return allConnections.reduce((acc,cur) => {
        if(cur.includes(trackId)) {
            acc.push(cur.filter(id => id !== trackId)[0])
        }

        return acc
    },[] as Identifier[])


}

export function switchGetStateForPath(swi: TrackSwitch, trackConnection: [number,number]): SwitchState {
    if(swi.junction.straightConnections.some(connection => xor(connection, trackConnection).length === 0)) {
        return SwitchState.Straight
    }
    if(swi.junction.sideConnections.some(connection => xor(connection, trackConnection).length === 0)) {
        return SwitchState.Side
    }


    throw new Error("No state found");
    
}