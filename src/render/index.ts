import { vec2 } from "gl-matrix";
import { flatten, head, tail } from "lodash";
import { Entity } from "../interfaces/entity";
import { DynamicEnvironment, Environment } from "../obj/environment";
import { toggleSignal } from "../obj/signal";
import { throwSwitch, TrackSwitch } from "../obj/switch";
import { TrackSegment } from "../obj/trackSegment";
import { createSignalRenderer, SignalSVGRenderer, updateSignalRender } from "./svg/signalRenderer";
import { createSwitchRenderer, SwitchSVGRenderer, updateSwitchRenderer } from "./svg/switchRenderer";
import { createTrackSegmentRenderer, TrackSegmentSVGRender, updateTrackRender } from "./trackRenderer";

// const LABEL_OFFSET = 10;

export const COLOR_UNOCCUPIED="#aaa";
export const COLOR_OCCUPIED="#f5ff44"

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

function renderDebugIds(entities: Entity[], containingElement: SVGGElement) {
    entities.forEach(ent => {
        if(!ent.renderData) return;

        const position = vec2.create();
        
        if(ent.renderData.start && ent.renderData.end) {
            vec2.lerp(position,ent.renderData.start,ent.renderData.end,0.5);
        } else if (ent.renderData.position) {
            vec2.copy(position, ent.renderData.position);
        } else {
            return;
        }

        if(typeof ent.id === "undefined") {
            return;
        }

        const svgText = document.createElementNS("http://www.w3.org/2000/svg", "text")
        svgText.innerHTML = ent.id + "",
        svgText.setAttribute("x", position[0] + "");
        svgText.setAttribute("y", position[1] - 10 + "");
        svgText.setAttribute("text-anchor", "middle"); //Centering horizontally

        containingElement.appendChild(svgText);
    })
}

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

// function createTrackRenderers(tracks: Track[], containingElement: SVGElement): TrackSegmentSVGRender[] {

    
    // return flatten(tracks.map((track: Track, index): TrackSegmentSVGRender[] => {
    //         // const [startBoundary, endBoundary] = track.boundries;

    //         // if (!startBoundary.renderData || !endBoundary.renderData) {
    //         //     throw new Error("Boundary lacks renderData");
    //         // }


    //         // if (!startBoundary.renderData.position || !endBoundary.renderData.position) {
    //         //     throw new Error("Boundary lacks proper renderData");
    //         // }

    //         // const startPos = startBoundary.renderData.position;
    //         // const endPos = endBoundary.renderData.position;

    //         const switchOffset: [boolean, boolean] = [
    //             !shouldDrawAllTheWay(track, startBoundary),
    //             !shouldDrawAllTheWay(track, endBoundary)
    //         ];


    //         // if(!shouldDrawAllTheWay(track, startBoundary)) {
    //         //     vec2.add(startDrawPos,startDrawPos,lineOffset);
    //         // }
    //         // if(!shouldDrawAllTheWay(track, endBoundary)) {
    //         //     vec2.subtract(endDrawPos, endDrawPos, lineOffset);
    //         // }
    //         const trackDetectionSegments = track.segments.detection;

    //         const segments =  trackDetectionSegments.map((trackDetectionSegment) : TrackSegmentSVGRender =>  {
    //             const [segmentStart, segmentEnd] = getRenderPositionsForTrackSegment([startPos, endPos], switchOffset, track.length, trackDetectionSegment);

    //             const line: SVGLineElement = document.createElementNS("http://www.w3.org/2000/svg", "line");

    //             line.setAttribute("x1", "" + segmentStart[0]);
    //             line.setAttribute("y1", "" + segmentStart[1]);
    //             line.setAttribute("x2", "" + segmentEnd[0]);
    //             line.setAttribute("y2", "" + segmentEnd[1]);
    //             // line.setAttribute("stroke", getColorForOccupationStatus(isTrackOccupied(track.id, occupiedTrackIds)))
    //             // line.setAttribute("stroke", getColorForOccupationStatus(isSectionOccupied(trackDetectionSegment, occupiedSegments)));
    //             line.setAttribute("id", "" + index);

    //             containingElement.appendChild(line);

    //             return {
    //                 element: line,
    //                 track: track,
    //                 trackSegment: trackDetectionSegment
    //             }
    //         })
            
    //         return segments;

            // if(isTrack(ent) && ent.segments.length > 0) {
            // track.segments.forEach(segment => {
            //     [segment.end,segment.end].forEach(segmentPoint => {
            //         const pos = segmentPoint/track.length;
            //         const DIVIDER_LENGTH = 8;
            //         const basePos = vec2.lerp(vec2.create(),startPos,endPos,pos);
            //         const normal = getLineNormal(startPos,endPos);
            //         const posA = vec2.scaleAndAdd(vec2.create(),basePos,normal,DIVIDER_LENGTH)
            //         const posB = vec2.scaleAndAdd(vec2.create(),basePos,normal,-DIVIDER_LENGTH)
            //         const line: SVGElement = document.createElementNS("http://www.w3.org/2000/svg","line");
            //         line.setAttribute("x1", ""+ posA[0])
            //         line.setAttribute("y1", ""+ posA[1])
            //         line.setAttribute("x2", ""+ posB[0])
            //         line.setAttribute("y2", ""+ posB[1])
            //         line.setAttribute("stroke", COLOR_UNOCCUPIED),
            //         line.setAttribute("stroke-width", "1.5"),
            //         line.setAttribute("id", "" + index);
            //         containingElement.appendChild(line);
            //     })
            // })
        // })
//     )
// }

// function renderTrack(trackRenderer: TrackSegmentSVGRender) {

// }

export function createSVGElement<K extends keyof SVGElementTagNameMap>(elementName: K): SVGElementTagNameMap[K] {
    return document.createElementNS("http://www.w3.org/2000/svg", elementName);
}

export class SVGRenderer {
    env: Environment;
    renderElement: SVGElement;
    trackGroup: SVGGElement;
    textGroup: SVGGElement;
    interactableGroup: SVGGElement;
    trackRenderers: TrackSegmentSVGRender[];
    signalGroup: SVGGElement;
    signRenderers: SignalSVGRenderer[];
    switchRenderers: SwitchSVGRenderer[];

    constructor(env: Environment, renderElement: SVGElement) {
        this.env = env;
        this.renderElement = renderElement

        this.trackGroup = createSVGElement("g");
        this.textGroup = createSVGElement("g");
        this.interactableGroup = createSVGElement("g");
        this.signalGroup = createSVGElement("g");

        this.signRenderers = this.env.signals.map(signal => {
            return createSignalRenderer(signal,this.signalGroup);
        })

        // this.trackRenderers = createTrackRenderers(env.tracks, this.trackGroup);

        this.trackRenderers = flatten(this.env.tracks.map(track => {
                return createTrackSegmentRenderer(track, this.trackGroup)
        }));

        this.switchRenderers = this.env.switches.map(trackSwitch => {
            return createSwitchRenderer(trackSwitch, this.env.tracks, this.trackGroup);
        })

        renderSwitchInteractables(this.env.switches, this.interactableGroup);
        renderSignalInteractables(this.signRenderers,this.interactableGroup);
        renderDebugIds(this.env.entities, this.textGroup);

        renderElement.appendChild(this.trackGroup);
        renderElement.appendChild(this.textGroup);
        renderElement.appendChild(this.interactableGroup);
        renderElement.appendChild(this.signalGroup);
    }

    render(dynamicEnvironment: DynamicEnvironment): void {
        this.trackRenderers.forEach( trackRenderData => {
            updateTrackRender(trackRenderData, dynamicEnvironment.occupiedTrackSegments)
        });

        this.signRenderers.forEach(signRenderer => {
            updateSignalRender(signRenderer)
        })

        this.switchRenderers.forEach(r => updateSwitchRenderer(r,dynamicEnvironment));
    }
}

function renderSwitchInteractables(switches: TrackSwitch[], interactableGroup: SVGGElement) {
    switches.forEach(trackSwitch => {
        const circle = createSVGElement("circle");
        circle.setAttribute("cx", trackSwitch.renderData.position[0]);
        circle.setAttribute("cy", trackSwitch.renderData.position[1]);
        circle.setAttribute("r", "10");
        circle.setAttribute("fill", "none");
        circle.setAttribute("stroke-width", "1");
        circle.setAttribute("stroke", COLOR_UNOCCUPIED)
        circle.setAttribute("opacity", ".3")
        circle.setAttribute("pointer-events", "bounding-box");

        circle.addEventListener("click", () => {
            throwSwitch(trackSwitch);
        })


        interactableGroup.appendChild(circle);
    })
}

function renderSignalInteractables(signal: SignalSVGRenderer[], interactableGroup: SVGGElement) {
    signal.forEach(signal => {
        const circle = createSVGElement("circle");
        circle.setAttribute("cx", signal.position[0] + "");
        circle.setAttribute("cy", signal.position[1] + "");
        circle.setAttribute("r", "10");
        circle.setAttribute("fill", "none");
        circle.setAttribute("stroke-width", "1");
        circle.setAttribute("stroke", COLOR_UNOCCUPIED)
        circle.setAttribute("pointer-events", "bounding-box");

        circle.addEventListener("click", () => {
            toggleSignal(signal.signal)
        })


        interactableGroup.appendChild(circle);
    })
}
