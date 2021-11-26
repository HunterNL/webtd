import { flatten } from "lodash";
import { Entity, getEntityById } from "../../interfaces/entity";
import { isBuffer } from "../physical/buffer";
import { Direction, DIRECTION_BACKWARD, DIRECTION_FORWARD, TrackPosition } from "../physical/situation";
import { switchGetPossiblePaths, TrackBoundary } from "../physical/switch";
import { isTrack, isWeld, Track, trackGetBoundaryInDirection, trackGetBoundaryOffset, trackGetDetectionSegmentAjoiningBoundary, trackGetDirectionAwayFromBoundary, trackGetDirectionTowardsBoundary, trackGetNextSegmentInDirection, trackGetOtherBoundary, trackSegmentGetWeld, TrackWeld, weldGetAjoiningSegments } from "../physical/track";
import { segmentCreate, TrackSegment } from "../physical/trackSegment";
import { TrackSpan } from "../trackSpan";

export function findRoutes(entities: Entity[], track: Track, startPos: TrackWeld | TrackBoundary, direction: TrackBoundary | Direction, currentSpan?: TrackSegment[]): TrackSegment[][] {
    const span = currentSpan || [];


    const realDirection = typeof direction === "number" ? direction : trackGetDirectionTowardsBoundary(track, direction.id)
    let initialSegment : TrackSegment;

    if(startPos.type === "weld") {
        const {front,back} = weldGetAjoiningSegments(track, startPos);
        if(realDirection === DIRECTION_FORWARD) {
            initialSegment = front
        } else {
            initialSegment = back
        }
    } else {
        initialSegment = trackGetDetectionSegmentAjoiningBoundary(track, startPos.id);
    }

    span.push(initialSegment);
    let currentSegment : TrackSegment | undefined = initialSegment;

    while(true) {    
        currentSegment = trackGetNextSegmentInDirection(track, currentSegment!, realDirection);

        if(currentSegment) {
            span.push(currentSegment);
            continue
        } 

        // If undefined, we hit a track boundary
        const nextBoundary = trackGetBoundaryInDirection(track, realDirection);
        if(nextBoundary.type === "end") {
            return [span];
        }
        if(nextBoundary.type === "switch") {
            const nextTrackIds = switchGetPossiblePaths(nextBoundary.junction, track.id);
            const tracks = nextTrackIds.map(id => getEntityById(entities, id, isTrack));

            return tracks.map(track => {
                const otherBoundary = trackGetOtherBoundary(track, nextBoundary.id);
                return flatten(findRoutes(entities,track,nextBoundary,otherBoundary, ([] as TrackSegment[]).concat(span)))
            })
        }
        throw new Error("Unknown trackboundary type")


        // const nextBoundary = trackSegmentGetWeld(track, currentSegment, direction);


        // if(nextBoundary.type === "weld") {
        //     currentSegment = trackGetNextSegmentInDirection()
        // }
    }
    

    // // const nextBoundary = trackGetBoundaryInDirection(track, nextBoundary);
    // const boundaryOffset = trackGetBoundaryOffset(track, nextBoundary.id);
    // // const currentSegment = segmentCreate(track, offset, boundaryOffset);

    // span.segments!.push(initialSegment);

    // if (isBuffer(nextBoundary)) {
    //     span.endPosition = {
    //         track, offset: boundaryOffset
    //     },
    //         span.finalDirection = trackGetDirectionTowardsBoundary(track, nextBoundary.id);

    //     return [span as TrackSpan];
    // } else {
    //     const nextTrackIds = switchGetPossiblePaths(nextBoundary.junction, track.id);
    //     const tracks = nextTrackIds.map(id => getEntityById(entities, id, isTrack));
    //     const spans = tracks.map(track => {

    //         // Fresh object so the following calls wont all reference the same one
    //         const newSpan: Partial<TrackSpan> = {
    //             startPosition: span.startPosition,
    //             segments: ([] as any[]).concat(span.segments)
    //         };

    //         const position: TrackPosition = {
    //             track,
    //             offset: trackGetBoundaryOffset(track, nextBoundary.id)
    //         };
    //         const direction = trackGetDirectionAwayFromBoundary(track, nextBoundary.id);
    //         return findRoutes(entities, position, direction, newSpan);
    //     });

    //     return flatten(spans);

    // }

    // throw new Error("Unknown boundary");
}
