import { vec2 } from "gl-matrix";
import { createSVGElement } from "..";
import { Signal } from "../../obj/signal";
import { getLinePositions } from "../trackRenderer";

export type SignalSVGRenderer = {
    signal: Signal,
    position: vec2,
    renderLabel?: string
}

export function getSignalFractionalLocation(signal: Signal): number {
    const trackLength = signal.position.track.length;
    
    return signal.position.offset / trackLength;
}


export function createSignalRenderer(sign: Signal, parentElement: SVGElement) : SignalSVGRenderer {

    const svgText = createSVGElement("text");

    const label = sign?.renderData?.label || "SIGNAL";

    const [startPos,endPos] = getLinePositions(sign.position.track);
    const positionFraction = getSignalFractionalLocation(sign);

    const signalRenderLocation = vec2.lerp(vec2.create(), startPos, endPos, positionFraction);

    svgText.setAttribute("x", ""+ signalRenderLocation[0] );
    svgText.setAttribute("y", ""+ (signalRenderLocation[1]+10) );
    svgText.setAttribute("text-anchor", "middle"); //Centering horizontally
    svgText.innerHTML = label;

    parentElement.appendChild(svgText);

    return {
        position: signalRenderLocation,
        signal: sign,
        renderLabel: label
    }
}