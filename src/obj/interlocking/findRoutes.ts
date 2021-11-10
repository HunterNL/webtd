import { flatten } from "lodash";
import { Entity, getEntityById } from "../../interfaces/entity";
import { isBuffer } from "../physical/buffer";
import { Direction, TrackPosition } from "../physical/situation";
import { switchGetPossiblePaths } from "../physical/switch";
import { isTrack, trackGetBoundaryInDirection, trackGetBoundaryOffset, trackGetDirectionAwayFromBoundary, trackGetDirectionTowardsBoundary } from "../physical/track";
import { segmentCreate } from "../physical/trackSegment";
import { TrackSpan } from "../trackSpan";

export function findRoutes(entities: Entity[], trackPosition: TrackPosition, direction: Direction, currentSpan?: Partial<TrackSpan>): TrackSpan[] {
    const span: Partial<TrackSpan> = currentSpan || {
        startPosition: trackPosition,
        segments: [],
    };

    const { track, offset } = trackPosition;
    const nextBoundary = trackGetBoundaryInDirection(track, direction);
    const boundaryOffset = trackGetBoundaryOffset(track, nextBoundary.id);
    const currentSegment = segmentCreate(track, offset, boundaryOffset);

    span.segments!.push(currentSegment);

    if (isBuffer(nextBoundary)) {
        span.endPosition = {
            track, offset: boundaryOffset
        },
            span.finalDirection = trackGetDirectionTowardsBoundary(track, nextBoundary.id);

        return [span as TrackSpan];
    } else {
        const nextTrackIds = switchGetPossiblePaths(nextBoundary.junction, track.id);
        const tracks = nextTrackIds.map(id => getEntityById(entities, id, isTrack));
        const spans = tracks.map(track => {

            // Fresh object so the following calls wont all reference the same one
            const newSpan: Partial<TrackSpan> = {
                startPosition: span.startPosition,
                segments: ([] as any[]).concat(span.segments)
            };

            const position: TrackPosition = {
                track,
                offset: trackGetBoundaryOffset(track, nextBoundary.id)
            };
            const direction = trackGetDirectionAwayFromBoundary(track, nextBoundary.id);
            return findRoutes(entities, position, direction, newSpan);
        });

        return flatten(spans);

    }

    throw new Error("Unknown boundary");
}
