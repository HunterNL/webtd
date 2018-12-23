import { Environment } from "../obj/environment";
import { getEntityById, isEntity } from "../interfaces/entity";
import { vec2 } from "gl-matrix";
import { Track, situationIsOnTrack, trackIsOccupied } from "../obj/track";

const LABEL_OFFSET = 10;

const COLOR_UNOCCUPIED="#aaa";
const COLOR_OCCUPIED="#f5ff44"

function calculateLabelPostion(veca: vec2 ,vecb: vec2) {
    const basePosition = vec2.lerp(vec2.create(), veca, vecb, 0.5);// Base 

    const diff = vec2.subtract(vec2.create(),vecb,veca);
    vec2.normalize(diff,diff);

    const angle = Math.atan2(diff[1], diff[0]);

    vec2.rotate(diff,diff,[0,0],-.5*Math.PI);    

    vec2.scaleAndAdd(basePosition,basePosition,diff,LABEL_OFFSET);

    return {
        pos: basePosition,
        angle
    }
}

function getColorForOccupationStatus(occupied: boolean): string {
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

export function renderEnv(env: Environment,map: RenderMap,renderElement: SVGElement) {
    renderElement.childNodes.forEach(child => renderElement.removeChild(child));

    

    map.forEach((renderMap,index) => {
        const ent = getEntityById(env.entities, renderMap.entId, isEntity);

        trackIsOccupied(ent as Track, env.rides);


        const line: SVGElement = document.createElementNS("http://www.w3.org/2000/svg","line");
        line.setAttribute("x1", ""+ renderMap.start[0])
        line.setAttribute("y1", ""+ renderMap.start[1])
        line.setAttribute("x2", ""+ renderMap.end[0])
        line.setAttribute("y2", ""+ renderMap.end[1])
        line.setAttribute("stroke", getColorForOccupationStatus(false))
        line.setAttribute("id", "" + index);


        if(renderMap.label) {
            const text = document.createElementNS("http://www.w3.org/2000/svg","text");
            // const textPath = document.createElementNS("https://www.w3.org/2000/svg", "textPath");

            text.innerHTML = renderMap.label

            const {start,end } = renderMap

            const {pos,angle} = calculateLabelPostion(start,end);

            const angleDegrees = angle !== 0 ? (Math.PI / angle) : 0

            text.setAttribute("x", pos[0])
            text.setAttribute("y", pos[1])

            text.setAttribute("transform", `rotate(${angleDegrees} ${pos[0]} ${pos[1]})`)
            // text.setAttribute("rotate","30");
            
            // textPath.setAttribute("href", "#" + index);




            // textPath.innerHTML="LABEL"

            // text.appendChild(textPath);

            renderElement.appendChild(text)
        }

        renderElement.appendChild(line)
    })

}