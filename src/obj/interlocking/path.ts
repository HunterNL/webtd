import { Entity } from "../../interfaces/entity";
import { joinWith } from "../../util/joinWith";
import { Direction, TrackPosition } from "../physical/situation";
import { isSwitch, switchGetStateForPath, SwitchState, TrackBoundary, TrackSwitch } from "../physical/switch";
import { Track } from "../physical/track";
import { TrackSegment } from "../physical/trackSegment";
import { TrackSpan } from "../trackSpan";
import { findRoutes } from "./findRoutes";

type PathSwitch = {
    switch: TrackSwitch;
    state: SwitchState;
};

export type Path = {
    toTrack: Track,
    switchStates: PathSwitch[],
    _span: TrackSpan
}

function findCommonBoundary(leftSegment: TrackSegment, rightSegment: TrackSegment): TrackBoundary {
    if(leftSegment.startBoundary) {
        if(leftSegment.startBoundary.id === rightSegment.startBoundary?.id) {
            return leftSegment.startBoundary;
        }

        if(leftSegment.startBoundary.id === rightSegment.endBoundary?.id) {
            return leftSegment.startBoundary;
        }
    }

    if(leftSegment.endBoundary) {
        if(leftSegment.endBoundary.id === rightSegment.startBoundary?.id) {
            return leftSegment.endBoundary;
        }

        if(leftSegment.endBoundary.id === rightSegment.endBoundary?.id) {
            return leftSegment.endBoundary;
        }
    }

    throw new Error("No connection found");
}

function pathFromSpan(entities: Entity[], span: TrackSpan): Path {  
    let switches : PathSwitch[] = [] as any[];

    if(span.segments.length > 1) {
        switches = joinWith(span.segments, (a,b) => {
            const trackBoundary = findCommonBoundary(a, b);
    
            if(!isSwitch(trackBoundary)) {
                throw new Error("wtf");    
            }
    
            const state = switchGetStateForPath(trackBoundary, [a.trackId,b.trackId])
    
            return {
                switch: trackBoundary,
                state
            }
    
        })
    }

    return {
        switchStates: switches,
        _span: span,
        toTrack: span.endPosition.track
    }
}

export function pathsfromLocation(entities: Entity[], position: TrackPosition ,direction: Direction): Path[] {
    return findRoutes(entities, position, direction).map(span => {
        return pathFromSpan(entities, span)
    })
}