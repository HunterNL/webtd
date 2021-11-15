import { vec2 } from "gl-matrix";
import { add, first, head, initial, last, tail } from "lodash";
import { Path } from "../obj/interlocking/path";
import { Ride } from "../obj/physical/ride";
import { TrackSegment } from "../obj/physical/trackSegment";
import { joinWith } from "../util/joinWith";
import { vec2ToTuple } from "../util/vec2";

// const LABEL_OFFSET = 10;

export const COLOR_UNOCCUPIED="#aaa";
export const COLOR_OCCUPIED="#f5ff44"
export const COLOR_PATH="#00bd25"

export const SWITCH_RENDER_RADIUS = 12;

const SWITCH_WRONGWAY_OFFSET = 25;

const SEGMENT_DISTANCE = 1;




// function getLineNormal(veca:vec2,vecb:vec2): vec2 {
//     const diff = vec2.subtract(vec2.create(),vecb,veca);
//     vec2.normalize(diff,diff);

//     return vec2.rotate(diff,diff,[0,0],-.5*Math.PI);   
// }

// function getLineAngle(veca:vec2,vecb:vec2): number {
//     return Math.atan2(getLineVector(veca, vecb));
// }

export function getLineVector(veca:vec2,vecb:vec2): vec2 {
    const diff = vec2.subtract(vec2.create(),vecb,veca);
    return vec2.normalize(diff,diff);
}

// function calculateLabelPostion(veca: vec2 ,vecb: vec2) {
//     const basePosition = vec2.lerp(vec2.create(), veca, vecb, 0.5);// Base 

//     const diff = vec2.subtract(vec2.create(),vecb,veca);
//     vec2.normalize(diff,diff);

//     const angle = Math.atan2(diff[1], diff[0]);

//     vec2.rotate(diff,diff,[0,0],-.5*Math.PI);    

//     vec2.scaleAndAdd(basePosition,basePosition,diff,LABEL_OFFSET);

//     return {
//         pos: basePosition,
//         angle
//     }
// }

export function getColor(ride?: Ride, path?: Path): string {
    if(ride) {
        return COLOR_OCCUPIED;
    }

    if(path) {
        return COLOR_PATH
    }

    return COLOR_UNOCCUPIED;
}

export function getColorForOccupationStatus(occupied: boolean): string {
    return occupied ? COLOR_OCCUPIED : COLOR_UNOCCUPIED;
}

export type RenderMapping = {
    type: "track",
    entId: number,
    start: [number,number],
    end: [number,number],
    label?: string
}
export type RenderMap = RenderMapping[]

// function isSectionOccupied(trackSegment: TrackSegment, occupiedSegments: TrackSegment[]): boolean {
//     return occupiedSegments.some(occupiedSegment => {
//         return doSegmentsOverlap(occupiedSegment, trackSegment)
//     })
// }

export function createPathString(positions: vec2[]) {
    return "M " + head(positions)?.join(" ") + tail(positions).map(a => "L " + a.join(" ")).join(" ")
}

export function getRenderPositionsForTrackSegment(trackRenderPositions: [vec2,vec2], switchOffset: [boolean,boolean], trackLength: number, segment: TrackSegment): [vec2,vec2] {
    const [startPos,endPos] = trackRenderPositions;
    const [startOffset, endOffset] = switchOffset;

    const lineVector = getLineVector(startPos, endPos);
    const drawLineLength = vec2.distance(startPos, endPos)

    const startPosFraction = 0
    const endPosFraction = 1
    // const startPosFraction = segment.start / trackLength;
    // const endPosFraction = segment.end / trackLength;

    const startVec = vec2.scale(vec2.create(), lineVector, startPosFraction * drawLineLength);
    const endVec = vec2.scale(vec2.create(), lineVector, endPosFraction * drawLineLength);

    vec2.add(startVec, startVec, startPos);
    vec2.add(endVec, endVec, startPos);

    vec2.add(startVec,  startVec, vec2.scale(vec2.create(), lineVector, SEGMENT_DISTANCE))
    vec2.add(endVec , endVec, vec2.scale(vec2.create(), lineVector, -SEGMENT_DISTANCE))

    if(startOffset && segment.start === 0) {
        vec2.add(startVec, startVec, vec2.scale(vec2.create(), lineVector, SWITCH_WRONGWAY_OFFSET))
    }

    if(endOffset && segment.end === trackLength) {
        vec2.sub(endVec, endVec, vec2.scale(vec2.create(), lineVector, SWITCH_WRONGWAY_OFFSET))
    }

    return [startVec,endVec];
}

export function shortenStart(waypoints: vec2[], margin: number): vec2[] {
    const direction = getLineVector(waypoints[0],waypoints[1])

    const firstPoint =  vec2.scaleAndAdd(vec2.create(), waypoints[0], direction, margin);

    return [firstPoint,...tail(waypoints)]
}

export function shortenEnd(waypoints: vec2[], margin: number): vec2[] {
    const length = waypoints.length;
    const direction = getLineVector(waypoints[length-1],waypoints[length-2])

    const lastPoint =  vec2.scaleAndAdd(vec2.create(), waypoints[length-1], direction, margin);

    return [...initial(waypoints),lastPoint];
}

export function vec2pathLength(positions:vec2[]): number {
    return joinWith(positions, vec2.distance).reduce(add,0);
}

export function vec2PathLerp(positions: vec2[], lerp: number): [number,number] {
    if(positions.length < 2) {
        throw new Error("Path too short, needs at least 2 positions");
    }

    if(lerp > 1 || lerp < 0) {
        throw new Error("Lerp out of range, extrapolation unimplemented");
    }

    // Common case
    if(positions.length === 2) {
        return vec2.lerp(vec2.create(), positions[0], positions[1], lerp) as [number,number];
    }

    //Handle 0 and 1 manually to avoid some possible floating point issues
    if(lerp === 0) {
        return vec2ToTuple(first(positions) as vec2) // Length is guarenteed above, safe cast
    } else if (lerp === 1) {
        return vec2ToTuple(last(positions) as vec2) 
    }

    const positionOnTrack = vec2pathLength(positions) * lerp;

    let lastPos = positions[0];
    let totalDistance = 0;

    for (let index = 1; index < positions.length; index++) { // note index = 1
        const currentPosition = positions[index];
        const legDistance = vec2.distance(lastPos, currentPosition);

        totalDistance = totalDistance + legDistance;

        if(totalDistance === positionOnTrack) {
            // We're exactly at a waypoint 
            return [currentPosition[0],currentPosition[1]]
        }
        
        if(totalDistance > positionOnTrack) {
            // We've "moved" past the point on the path, point is in the last leg

            const positionOnLeg = totalDistance - positionOnTrack;
            const positionFraction = positionOnLeg / legDistance;

            return vec2ToTuple(vec2.lerp(vec2.create(), currentPosition, lastPos, positionFraction));
        }

        lastPos = currentPosition;
    }

    throw new Error("Somehow could not find position on path");
}