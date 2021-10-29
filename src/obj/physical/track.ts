import { vec2 } from "gl-matrix";
import { head, isUndefined, last } from "lodash";
import { Entity, getEntityById } from "../../interfaces/entity";
import { getId, Identifiable, Identifier, isIdentifiable } from "../../interfaces/id";
import { isLengthable, Lengthable } from "../../interfaces/lengthable";
import { vec2PathLerp } from "../../render";
import { requireRenderPosition } from "../../render/svg/switchRenderer";
import { Direction, DIRECTION_FORWARD, TrackPosition } from "./situation";
import { isSwitch, isTrackBoundary, resolveBoundary, TrackBoundary } from "./switch";
import { TrackSegment, splitRangeAtPoints } from "./trackSegment";

export const SWITCH_WELD_OFFSET = 10;
export const MIN_BLOCK_SIZE = 100;



// A track is the full lenght of track between two of either a switch or endpoint
export type Track = Identifiable & Lengthable & Entity & {
    boundries: [TrackBoundary, TrackBoundary],
    length: number,
    renderData?: {
        rawFeatures: TrackFeature[],
    },
    type: "track",
    segments: {
        detection: TrackSegment[]
    }

}

type TrackWeld = {
    type:"weld",
    offset: number,
    position?: vec2
}

export function isWeld(feature: TrackFeature): feature is TrackWeld {
    return feature.type === "weld";
}

type TrackRenderPoint = {
    type: "renderPoint",
    position: vec2
}

export type TrackFeature = TrackWeld | TrackRenderPoint

export function createTrack(id: number, startBoundary: TrackBoundary, endBoundary: TrackBoundary, length: number): Track {
    return {
        boundries: [startBoundary, endBoundary],
        id,
        length,
        segments: { detection: [] },
        type: "track"
    }
}

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

export interface TrackSave extends Identifiable, Lengthable, Entity {
    boundries: [number, number],
    renderData: any,
    features: TrackFeature[]
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

export function trackGetWeldOffsets(trackSave: TrackSave): number[] {
    if(!Array.isArray(trackSave.features)) {
        return []
    }

    return trackSave.features.filter(isWeld).map(w => w.offset);
}

export function trackLoad(entities: Entity[], trackSave: TrackSave): Track {
    const trackId = trackSave.id;
    const boundaries = resolveBoundries(entities, trackSave.boundries);
    const forcedWelds = trackGetWeldOffsets(trackSave)

    return {
        id: trackId,
        boundries: boundaries,
        length: trackSave.length,
        type: "track",
        segments: {
            detection: generateSegments(trackId, boundaries, trackSave.length, forcedWelds)
        },
        renderData: {
            rawFeatures: trackSave.features
        }
    }
}

export function trackGetRenderPath(track: Track): vec2[] {
    const startPos = requireRenderPosition(track.boundries[0]);
    const endPos = requireRenderPosition(track.boundries[1]);

    if(!track.renderData) {
        return [startPos,endPos]
    }

    const features = track.renderData.rawFeatures;

    if(!Array.isArray(features)) {
        return [startPos,endPos]
    }

    const waypoints = features.filter(feature => typeof feature.position !== "undefined").map(feature => feature.position) as vec2[];
    return [startPos,...waypoints,endPos];   
}

export function trackGetFeatures(track: Track): TrackFeature[] {
    if(isUndefined(track.renderData)) {
        return []
    }

    if(Array.isArray(track.renderData.rawFeatures)) {
        return track.renderData.rawFeatures
    }

    return [];
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

export function getNextBoundary(track: Track, direction: Direction): TrackBoundary {
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

// function fixSwitchOffset(blocks: DetectionBlock[], startsWithSwitch: boolean, endsWithSwitch: boolean) {


//     if(startsWithSwitch) {
//         const firstBlock = blocks[0];
//         firstBlock.renderPoints[0] = firstBlock
//     }

    
// }
