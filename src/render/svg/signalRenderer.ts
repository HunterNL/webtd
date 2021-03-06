import { vec2 } from "gl-matrix";
import { last } from "lodash";
import { SWITCH_RENDER_RADIUS, vec2PathLerp } from "..";
import { trackGetRenderPath } from "../../obj/physical/track";
import { ASPECT_STOP, Signal } from "../../obj/physical/signal";
import { pathAddSwitchMargin } from "../trackRenderer";
import { createSVGElement } from ".";

const SVG_CONTENT = `<svg viewBox="184.686 41.924 130.627 182.26" width="130.627" height="182.26" xmlns="http://www.w3.org/2000/svg">
  <path d="M 609 301 m -46.691 0 a 46.691 46.691 0 1 0 93.382 0 a 46.691 46.691 0 1 0 -93.382 0 Z M 609 301 m -28.015 0 a 28.015 28.015 0 0 1 56.03 0 a 28.015 28.015 0 0 1 -56.03 0 Z" transform="matrix(-0.80339, 0.595454, -0.595454, -0.80339, 918.49585, -13.57336)"/>
  <rect x="226.831" y="145.19" width="46.337" height="78.994"/>
</svg>`

export type SignalSVGRenderer = {
    signal: Signal,
    position: vec2,
    renderLabel?: string,
    svgElement: SVGElement,
    highlighted: boolean
}

export function getSignalFractionalLocation(signal: Signal): number {
    const trackLength = signal.position.track.length;

    return signal.position.offset / trackLength;
}


export function createSignalRenderer(signal: Signal, parentElement: SVGElement): SignalSVGRenderer {

    const svgGroup = createSVGElement("g");



    // svgText.setAttribute("viewbox", "184.686 41.924 130.627 182.26");
    // svgText.setAttribute("transform", "rotate(90deg)")
    // svgText.setAttribute("width", "50.627");
    // svgText.setAttribute("height", "50.26")

    svgGroup.innerHTML = SVG_CONTENT;

    // const label = signal?.renderData?.label || "SIGNAL";

    // TODO Support render waypoints?
    const rawPath = trackGetRenderPath(signal.position.track);
    const trackRenderPath = pathAddSwitchMargin(signal.position.track,rawPath,SWITCH_RENDER_RADIUS)
    const positionFraction = getSignalFractionalLocation(signal);
    const signalRenderLocation = vec2PathLerp(trackRenderPath, positionFraction)

    const endPos = last(trackRenderPath);

    if (!endPos) {
        throw new Error("Line lacks final waypoint")
    }
    
    // vec2.add(signalRenderLocation, signalRenderLocation, vec2.fromValues(0, 3));

    // svgText.setAttribute("x", ""+ signalRenderLocation[0] );
    // svgText.setAttribute("y", ""+ (signalRenderLocation[1]+10) );
    // svgGroup.setAttribute("text-anchor", "middle"); //Centering horizontally
    // svgGroup.setAttribute("transform-box", "fill-box");
    // svgGroup.setAttribute("transform-origin", "50% 50%")
    svgGroup.setAttribute("transform", "translate(" + signalRenderLocation[0] + "," + (signalRenderLocation[1] + 2) + ") scale(.1) rotate(90 50 50)")

    parentElement.appendChild(svgGroup);

    return {
        position: signalRenderLocation,
        signal: signal,
        renderLabel: "blah",
        svgElement: svgGroup,
        highlighted: false
    }
}

function getSignalColor(signal: SignalSVGRenderer): string {
    if(signal.highlighted) {
        return "#fff"
    }

    return (signal.signal.currentAspect === ASPECT_STOP ? "#f00" : "#0f0")
}

export function updateSignalRender(signal: SignalSVGRenderer) {
    const color = getSignalColor(signal)

    signal.svgElement.setAttribute("stroke", color);
    signal.svgElement.setAttribute("fill", color);
}