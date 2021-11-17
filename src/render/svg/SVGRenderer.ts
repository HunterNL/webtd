import { flatten, round } from "lodash";
import { createSVGElement, renderDebugIds } from ".";
import { DynamicEnvironment, PhysicalEnvironment } from "../../obj/environment";
import { DriverMode } from "../../obj/physical/driver";
import { Ride, rideGetDrivingPosition } from "../../obj/physical/ride";
import { TrackPosition } from "../../obj/physical/situation";
import { UserInput } from "../../obj/userinput";
import { isProduction } from "../../util/env";
import { trackCreateRenderBlocks } from "../trackCreateRenderBlocks";
import { createBlockRenderer, TrackSegmentSVGRender, updateTrackRender } from "../trackRenderer";
import { renderSwitchInteractables } from "./renderSwitchInteractables";
import { createRideDebugRenderer, RideDebugRenderer, updateRideDebugRenderer } from "./rideDebugRenderer";
import { renderSignalInteractables } from "./signalInteractables";
import { createSignalRenderer, SignalSVGRenderer, updateSignalRender } from "./signalRenderer";
import { createSwitchRenderer, SwitchSVGRenderer, updateSwitchRenderer } from "./switchRenderer";

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
    debugGroup: SVGGElement;
    debugRenderers: RideDebugRenderer[];
    labelGroup: SVGGElement;
    debugDisplayEnabled: boolean;

    constructor(env: PhysicalEnvironment, renderTarget: Rendertarget, inputHandler?: UserInput) {
        this.env = env;
        this.svgElement = renderTarget.svgElement;
        this.htmlElement = renderTarget.html;

        this.trackGroup = createSVGElement("g","tracks");
        this.textGroup = createSVGElement("g","text");
        this.interactableGroup = createSVGElement("g","interactables");
        this.signalGroup = createSVGElement("g","signals");
        this.debugGroup = createSVGElement("g","debug");
        this.labelGroup = createSVGElement("g","label");

        this.signRenderers = this.env.signals.map(signal => {
            return createSignalRenderer(signal, this.signalGroup);
        });

        const blocks = flatten(this.env.tracks.map(trackCreateRenderBlocks));

        this.blocks = blocks.map(block => createBlockRenderer(block, this.trackGroup, this.labelGroup ,inputHandler));

        this.switchRenderers = this.env.switches.map(trackSwitch => {
            return createSwitchRenderer(trackSwitch, this.env.tracks, this.trackGroup);
        });

        this.debugRenderers = [];

        renderSwitchInteractables(this.env.switches, this.interactableGroup);
        renderSignalInteractables(this.signRenderers, this.interactableGroup, inputHandler);
        
        this.svgElement.appendChild(this.trackGroup);
        this.svgElement.appendChild(this.textGroup);
        this.svgElement.appendChild(this.interactableGroup);
        this.svgElement.appendChild(this.signalGroup);
        this.svgElement.appendChild(this.debugGroup);
        this.svgElement.appendChild(this.labelGroup);
        
        this.debugDisplayEnabled = false;

        if(!isProduction()) {
            this.addDebugDisplay();
        }
    }


    addDebugDisplay() {
        this.debugDisplayEnabled = true;
        renderDebugIds(this.env.entities, this.textGroup);

        this.debugRenderers = this.env.rides.map(ride => {
            return createRideDebugRenderer(ride, this.debugGroup)
        })
    }

    render(dynamicEnvironment: DynamicEnvironment): void {
        this.blocks.forEach(block => {
            updateTrackRender(block, dynamicEnvironment);
        });

        this.signRenderers.forEach(signRenderer => {
            updateSignalRender(signRenderer);
        });

        this.switchRenderers.forEach(r => updateSwitchRenderer(r, dynamicEnvironment));

        this.debugRenderers.forEach(updateRideDebugRenderer);

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
    const position = rideGetDrivingPosition(ride)
    return `[${ride.id}] ${positionToString(position)} - ${position.track.length} - ${round(ride.speed,1)} | ${driveModeToString(ride.driverMode)}`;
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
