import { flatten, round } from "lodash";
import { DynamicEnvironment, PhysicalEnvironment } from "../../obj/environment";
import { createSignalRenderer, SignalSVGRenderer, updateSignalRender } from "./signalRenderer";
import { createSwitchRenderer, SwitchSVGRenderer, updateSwitchRenderer } from "./switchRenderer";
import { trackCreateRenderBlocks } from "../trackCreateRenderBlocks";
import { createBlockRenderer, TrackSegmentSVGRender, updateTrackRender } from "../trackRenderer";
import { renderSwitchInteractables } from "./renderSwitchInteractables";
import { createSVGElement, renderDebugIds } from ".";
import { renderSignalInteractables } from "./signalInteractables";
import { Ride } from "../../obj/physical/ride";
import { DriverMode } from "../../obj/physical/driver";
import { TrackPosition } from "../../obj/physical/situation";

type Rendertarget = {
    svgElement: SVGElement,
    html: HTMLDivElement
}


export class SVGRenderer {
    env: PhysicalEnvironment;
    svgElement: SVGElement;
    trackGroup: SVGGElement;
    textGroup: SVGGElement;
    interactableGroup: SVGGElement;
    // trackRenderers: TrackSegmentSVGRender[];
    signalGroup: SVGGElement;
    signRenderers: SignalSVGRenderer[];
    switchRenderers: SwitchSVGRenderer[];
    blocks: TrackSegmentSVGRender[];
    htmlElement: HTMLDivElement;

    constructor(env: PhysicalEnvironment, renderTarget: Rendertarget) {
        this.env = env;
        this.svgElement = renderTarget.svgElement;
        this.htmlElement = renderTarget.html;

        this.trackGroup = createSVGElement("g");
        this.textGroup = createSVGElement("g");
        this.interactableGroup = createSVGElement("g");
        this.signalGroup = createSVGElement("g");

        this.signRenderers = this.env.signals.map(signal => {
            return createSignalRenderer(signal, this.signalGroup);
        });

        // this.trackRenderers = createTrackRenderers(env.tracks, this.trackGroup);
        // this.trackRenderers = flatten(this.env.tracks.map(track => {
        //         return createBlockRenderer(track, this.trackGroup)
        // }));
        const blocks = flatten(this.env.tracks.map(trackCreateRenderBlocks));

        this.blocks = blocks.map(block => createBlockRenderer(block, this.trackGroup));

        this.switchRenderers = this.env.switches.map(trackSwitch => {
            return createSwitchRenderer(trackSwitch, this.env.tracks, this.trackGroup);
        });

        renderSwitchInteractables(this.env.switches, this.interactableGroup);
        renderSignalInteractables(this.signRenderers, this.interactableGroup);
        renderDebugIds(this.env.entities, this.textGroup);

        this.svgElement.appendChild(this.trackGroup);
        this.svgElement.appendChild(this.textGroup);
        this.svgElement.appendChild(this.interactableGroup);
        this.svgElement.appendChild(this.signalGroup);
    }

    render(dynamicEnvironment: DynamicEnvironment): void {
        this.blocks.forEach(block => {
            updateTrackRender(block, dynamicEnvironment.occupiedTrackSegments);
        });

        this.signRenderers.forEach(signRenderer => {
            updateSignalRender(signRenderer);
        });

        this.switchRenderers.forEach(r => updateSwitchRenderer(r, dynamicEnvironment));

        this.renderRides(this.env.rides);
    }
    renderRides(rides: Ride[]) {
        const div = this.htmlElement;
        while (div.firstChild) {
            div.removeChild(div.firstChild);
        }

        const elements = rides.map(ride => {
            const element = document.createElement("div");
            const text = document.createTextNode(rideToString(ride))
            element.appendChild(text);

            return element;
        })

        elements.forEach(a => div.appendChild(a));
    }
}

function rideToString(ride: Ride): string {
    return `[${ride.id}] ${positionToString(ride.position)} - ${ride.position.track.length} - ${round(ride.speed,1)} | ${driveModeToString(ride.driverMode)}`;
}

function driveModeToString(driverMode?: DriverMode): string {
    if(!driverMode) return "";

    if(driverMode.type==="maintain_speed") {
        return `maintain speed(${driverMode.targetSpeed})`
    }

    if(driverMode.type==="stop_at") {
        return `stop at(${positionToString(driverMode.stopPosition)})`
    }

    throw new Error("Unknown drivermode");
    
}

function positionToString(trackPostion: TrackPosition): string {
    return `[${trackPostion.track.id}]:${round(trackPostion.offset,0)}`
}
