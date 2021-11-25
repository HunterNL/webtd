import { vec2 } from "gl-matrix";
import { head, isNumber, last } from "lodash";
import { Entity, getEntityById } from "../../interfaces/entity";
import { getId, Identifiable, Identifier, isIdentifiable } from "../../interfaces/id";
import { isLengthable, Lengthable } from "../../interfaces/lengthable";
import { requireRenderPosition } from "../../render/svg/switchRenderer";
import { Saveable } from "../save";
import { Direction, DIRECTION_BACKWARD, DIRECTION_FORWARD, TrackPosition } from "./situation";
import { isSwitch, isTrackBoundary, resolveBoundary, TrackBoundary } from "./switch";
import { splitRangeAtPoints, TrackSegment } from "./trackSegment";

export const SWITCH_WELD_OFFSET = 10;
export const MIN_BLOCK_SIZE = 100;

// A track is the full lenght of track between two of either a switch or endpoint
export type Track = Identifiable & Lengthable & Entity & {
    boundries: [TrackBoundary, TrackBoundary],
    type: "track",
    segments: {
        detection: TrackSegment[]
    },
    features: TrackFeature[]
}

export type TrackWeld = FeaturePosition & {
    type:"weld",
    position: number,
    renderPosition?: [number,number],
    signalIds: Identifier[]
}

export function isWeld(feature: TrackFeature): feature is TrackWeld {
    return feature.type === "weld";
}

type TrackRenderPoint = FeaturePosition & {
    type: "renderPoint",
    renderPosition: [number,number]
}

type FeaturePosition = {
    position: number | "START" | "END" | "NONE"
}
export type TrackFeature = TrackWeld | TrackRenderPoint

function isNumberArray(r: any[]): r is number[] {
    return r.every(isNumber);
}

function helpGetFeaturesAndWelds(features?: TrackFeature[] | number[]): TrackFeature[] {
    if(typeof features === "undefined" ) {
        return []
    }

    if(isNumberArray(features)) {
        return features.map(weldFromOffset);
    }

    return features;
}


export function createTrack(id: number, startBoundary: TrackBoundary, endBoundary: TrackBoundary, length: number, features?: TrackFeature[] | number[] | undefined): Track {
    const realFeatures = helpGetFeaturesAndWelds(features);
    const weldPoints = featuresGetWeldOffsets(realFeatures);
    const detectionSegments = generateSegments(id, [startBoundary,endBoundary], length, weldPoints);

    return {
        boundries: [startBoundary, endBoundary],
        id,
        length,
        segments: { detection: detectionSegments },
        type: "track",
        features: realFeatures
    }
}

export type trackWeldArgument = Parameters<typeof createTrack>[4]

export function getBoundaryPosition(track: Track, boundaryId: number): number {
    const [entryBoundaryId, exitBoundaryId] = track.boundries.map(getId);

    if (boundaryId === entryBoundaryId) {
        return 0
    }

    if (boundaryId === exitBoundaryId) {
        return track.length;
    }

    throw new Error("Unknown boundaryId");
}

export type TrackSave = Saveable<Track> & {
    features: Saveable<TrackFeature[]>
};

export function weldFromOffset(position: number): TrackWeld {
    return { 
        type:"weld",
        position,
        signalIds: []
    }
}


export function isTrackSave(any: any): any is TrackSave {
    return any.type === "track";
}

export function resolveBoundries(entities: Entity[], ids: number[]): [TrackBoundary, TrackBoundary] {
    const entA = getEntityById(entities, ids[0], isTrackBoundary);
    const entB = getEntityById(entities, ids[1], isTrackBoundary);

    if (!entA || !entB) {
        throw new Error("Could not resolve boundary!");
    }

    return [entA, entB]
}

export function isTooShortForSegment(trackLength: number): boolean {
    return trackLength < (MIN_BLOCK_SIZE + SWITCH_WELD_OFFSET *2);
}

function createWeldPoints(trackLength: number, hasSwitchAtFront: boolean, hasSwitchAtBack: boolean): number[] {

    // Common case
    if (hasSwitchAtBack && hasSwitchAtFront) {
        if(isTooShortForSegment(trackLength)) {
            return [trackLength / 2]; // Small connection spur, split the track down the middle
        }

        // Regular track
        return [SWITCH_WELD_OFFSET, trackLength - SWITCH_WELD_OFFSET]
    }

    if (!hasSwitchAtFront && !hasSwitchAtBack) {
        return []; // Edge case, no connections outside whatsoever
    }

    //One side is a buffer from here on

    if(trackLength < 1) {
        throw new Error("Track too short");
    }

    // Attempt the full SWITCH_WELD_OFFSET, else fallback to 1
    const switchToWeldDistance = (trackLength >= MIN_BLOCK_SIZE ? SWITCH_WELD_OFFSET : 1);

    if(hasSwitchAtFront) {
        return [switchToWeldDistance];
    } else {
        return [trackLength-switchToWeldDistance]
    }
    
    // Unreachable
}

export function generateSegments(trackId: Identifier, boundaries: [TrackBoundary, TrackBoundary], length: number, dividers: number[]): TrackSegment[] {
    const [startBoundary, endBoundary] = boundaries;
    const switchWelds = createWeldPoints(length, isSwitch(startBoundary), isSwitch(endBoundary));
    const segments = splitRangeAtPoints(length, dividers.concat(switchWelds));

    return segments.map((range, index) => {
        return {
            start: range[0],
            end: range[1],
            trackId,
            startBoundary: (index === 0 ? startBoundary : undefined),
            endBoundary: (index === segments.length - 1 ? endBoundary : undefined)
        }
    })
}

export function segmentIsSwitchAdjecent(trackSegment: TrackSegment): boolean {
    return isSwitch(trackSegment.endBoundary) || isSwitch(trackSegment.startBoundary);
}

export function featuresGetWeldOffsets(features: TrackFeature[]): number[] {
    if(!Array.isArray(features)) {
        return []
    }

    return features.filter(isWeld).map(w => w.position);
}

export function trackLoad(entities: Entity[], trackSave: TrackSave): Track {
    const trackId = trackSave.id;
    const boundaries = resolveBoundries(entities, trackSave.boundries);
    const forcedWelds = featuresGetWeldOffsets(trackSave.features)
    const detectionSegments = generateSegments(trackId, boundaries, trackSave.length, forcedWelds);

    const {length} = trackSave;

    return {
        id: trackId,
        boundries: boundaries,
        length,
        type: "track",
        segments: {
            detection: detectionSegments
        },
        features: (Array.isArray(trackSave.features) ? trackSave.features : [])
    }
}

export function trackGetRenderPath(track: Track): vec2[] {
    const startPos = requireRenderPosition(track.boundries[0]);
    const endPos = requireRenderPosition(track.boundries[1]);

    const {features} = track;

    // Simple case, no features altering rendering
    if(!features.find(feature => feature.renderPosition)) {
        return [startPos,endPos]
    }

    const waypoints = features.filter(feature => typeof feature.renderPosition !== "undefined").map(feature => feature.renderPosition) as vec2[];
    return [startPos,...waypoints,endPos];   
}

export function trackGetDetectionSegmentAjoiningBoundary(track: Track, boundaryId: Identifier): TrackSegment {
    const isStartBoundary = track.boundries[0].id === boundaryId;
    const isEndBoundary = track.boundries[1].id === boundaryId;

    if(!isStartBoundary && !isEndBoundary) {
        throw new Error("Track doesn't border boundary");
    }

    let segment

    if(isStartBoundary) {
        segment = head(track.segments.detection);
    } else {
        segment = last(track.segments.detection)
    }

    if(!segment) {
        throw new Error("Did not get a segment");
    }

    return segment
}

export function trackGetStart(track: Track): TrackBoundary {
    return track.boundries[0];
}

export function trackGetEnd(track: Track): TrackBoundary {
    return track.boundries[1];
}

export function trackGetOtherEnd(track: Track, boundaryId: number): TrackBoundary {
    const start = trackGetStart(track);
    const end = trackGetEnd(track);

    if (boundaryId !== start.id && boundaryId !== end.id) {
        throw new Error("Given endId is not a boundary of this track");
    }

    if (boundaryId === start.id) {
        return end;
    }

    return start;
}

export function trackGetBoundaryInDirection(track: Track, direction: Direction): TrackBoundary {
    return (direction === DIRECTION_FORWARD ? track.boundries[1] : track.boundries[0]); //Forward = towards the last/second boundary
}

/***   
 * If given boundary between two tracks is a point where the offset flow reverses, AKA both tracks share a "high" or "low" point there
 */
export function boundaryReversesTrackDirection(boundary: TrackBoundary, trackA: Track, trackB: Track): boolean {
    const sharesLowPoint = trackA.boundries[0].id === trackB.boundries[0].id;
    const sharesHighPoint = trackB.boundries[1].id === trackB.boundries[1].id;

    return sharesLowPoint || sharesHighPoint;
}

export function trackGetNext(entities: Entity[], track: Track): Track | undefined {
    const boundary = trackGetEnd(track)
    const nextId = resolveBoundary(track, boundary);

    if (!nextId) return;

    return getEntityById(entities, nextId, isTrack);
}

export function isTrack(obj: any): obj is Track {
    return isLengthable(obj) &&
        Array.isArray((obj as Track).boundries) &&
        (obj as Track).boundries.every(isTrackBoundary) &&
        isIdentifiable(obj);
}

export function situationIsOnTrack(entities: Entity[], track: Track, position: TrackPosition): boolean {
    return position.track.id === track.id;
}

// TODO Handle very short pieces of track
export function getOffsetFromBoundaryDistance(track: Track, boundary: TrackBoundary, distance: number): number {
    if (boundary.id === track.boundries[0].id) {
        // Entering from the "front", offset is distance
        return distance
    } else {
        //Entering from the "rear", offset is length - distance
        return track.length - distance
    }
}

export function getDirectionAwayFromBoundary(track: Track, boundaryId: number): Direction {
    if (track.boundries[0].id === boundaryId) {
        return 1
    }
    if (track.boundries[1].id === boundaryId) {
        return -1
    }

    throw new Error("Unknown boundaryId");
}

export function trackGetOtherBoundary(track: Track, boundaryId: number): TrackBoundary {
    if (track.boundries[0].id === boundaryId) {
        return track.boundries[1];
    } else {
        return track.boundries[0];
    }
}

export function trackGetBoundaryOffset(track: Track, boundaryId: number): number {
    if(track.boundries[0].id === boundaryId) {
        return 0
    } 
    if(track.boundries[1].id === boundaryId) {
        return track.length
    }

    throw new Error("Unexpected boundary");
}

export function isStartBoundary(track: Track, boundaryId: Identifier): boolean {
    return track.boundries[0].id === boundaryId
}
export function isEndBoundary(track: Track, boundaryId: Identifier): boolean {
    return track.boundries[1].id === boundaryId
}
    
export function trackGetDirectionAwayFromBoundary(track: Track, boundaryId: Identifier): Direction {
    if(isStartBoundary(track, boundaryId)) {
        return DIRECTION_FORWARD
    }

    if(isEndBoundary(track, boundaryId)) {
        return DIRECTION_BACKWARD
    }

    throw new Error("Unknown boundaryId");
    
}

export function trackGetDirectionTowardsBoundary(track: Track, boundaryId: Identifier): Direction {
    return trackGetDirectionAwayFromBoundary(track, boundaryId) * -1 as Direction;
    
}
// function fixSwitchOffset(blocks: DetectionBlock[], startsWithSwitch: boolean, endsWithSwitch: boolean) {


//     if(startsWithSwitch) {
//         const firstBlock = blocks[0];
//         firstBlock.renderPoints[0] = firstBlock
//     }

    
// }
