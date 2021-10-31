import { vec2 } from "gl-matrix";
import { zipWith } from "lodash";
import { createSVGElement } from ".";
import { vec2pathLength, vec2PathLerp } from "..";
import { Ride } from "../../obj/physical/ride";
import { TrackPosition } from "../../obj/physical/situation";
import { trackGetRenderPath } from "../../obj/physical/track";

export type RideDebugRenderer = {
    ride: Ride,
    frontElement: SVGCircleElement,
    rearElement: SVGCircleElement
}


export function createRideDebugRenderer(ride: Ride, parentElement: SVGElement) {
    const frontElement = createSVGElement("circle");
    const rearElement = createSVGElement("circle");

    frontElement.setAttribute("stroke", "#61C9A8");
    rearElement.setAttribute("stroke", "#A53860");

    [frontElement,rearElement].forEach(element => {
        element.setAttribute("r", "2px");
        
        element.setAttribute("stroke-width", "1px");
        element.setAttribute("fill", "none");

        parentElement.appendChild(element);
    })

    return {
        ride,
        frontElement,
        rearElement
    }
}

export function getTrackPositionRenderPosition(trackPosition: TrackPosition): vec2 {
    const renderPath = trackGetRenderPath(trackPosition.track);
    return vec2PathLerp(renderPath, trackPosition.offset / trackPosition.track.length);
}

export function updateRideDebugRenderer(r: RideDebugRenderer) {
    const span = r.ride.span;

    zipWith([r.frontElement,r.rearElement],[span.startPosition,span.endPosition], (element, trackPosition) => {
        const trackRenderPos = getTrackPositionRenderPosition(trackPosition)

        element.setAttribute("cx", trackRenderPos[0]+"");
        element.setAttribute("cy", trackRenderPos[1]+"");
    })
}