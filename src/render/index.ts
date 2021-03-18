import { Environment } from "../obj/environment";
import { getEntityById, isEntity } from "../interfaces/entity";
import { vec2 } from "gl-matrix";
import { Track, situationIsOnTrack, trackIsOccupied, isTrack } from "../obj/track";
import { getSpanningTracks } from "../obj/ride";
import { flatten } from "lodash";
import { getId } from "../interfaces/id";

const LABEL_OFFSET = 10;

const COLOR_UNOCCUPIED="#aaa";
const COLOR_OCCUPIED="#f5ff44"


function getLineNormal(veca:vec2,vecb:vec2): vec2 {
    const diff = vec2.subtract(vec2.create(),vecb,veca);
    vec2.normalize(diff,diff);

    return vec2.rotate(diff,diff,[0,0],-.5*Math.PI);   
}

function getLineAngle(veca:vec2,vecb:vec2): number {
    const diff = vec2.subtract(vec2.create(),vecb,veca);
    vec2.normalize(diff,diff);

    return Math.atan2(diff[1], diff[0]);
}

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

export function renderEnv(env: Environment,renderElement: SVGElement) {
    renderElement.childNodes.forEach(child => renderElement.removeChild(child));

    const occupiedTracksArray = env.rides.map(ride => getSpanningTracks(env.entities,ride));
    const occupiedTracksIds = flatten(occupiedTracksArray).map(getId);

    function isTrackOccupied(trackId: number) {
        return occupiedTracksIds.includes(trackId);
    }
    

    env.tracks.forEach((track: Track ,index) => {

        const line: SVGElement = document.createElementNS("http://www.w3.org/2000/svg","line");
        line.setAttribute("x1", ""+ track.renderData.start[0])
        line.setAttribute("y1", ""+ track.renderData.start[1])
        line.setAttribute("x2", ""+ track.renderData.end[0])
        line.setAttribute("y2", ""+ track.renderData.end[1])
        line.setAttribute("stroke", getColorForOccupationStatus(isTrackOccupied(track.id)))
        line.setAttribute("id", "" + index);

        // if(isTrack(ent) && ent.segments.length > 0) {
            track.segments.forEach(segment => {
                [segment.end,segment.end].forEach(segmentPoint => {
                    const pos = segmentPoint/track.length;

                    const basePos = vec2.lerp(vec2.create(),track.renderData.start,track.renderData.end,pos);
                    const normal = getLineNormal(track.renderData.start,track.renderData.end);

                    const posA = vec2.scaleAndAdd(vec2.create(),basePos,normal,10)
                    const posB = vec2.scaleAndAdd(vec2.create(),basePos,normal,-10)


                    const line: SVGElement = document.createElementNS("http://www.w3.org/2000/svg","line");
                    line.setAttribute("x1", ""+ posA[0])
                    line.setAttribute("y1", ""+ posA[1])
                    line.setAttribute("x2", ""+ posB[0])
                    line.setAttribute("y2", ""+ posB[1])
                    line.setAttribute("stroke", "#faa"),
                    line.setAttribute("id", "" + index);
                    renderElement.appendChild(line);
                })
            })
        // }


        // if(renderMap.label) {
        //     const text = document.createElementNS("http://www.w3.org/2000/svg","text");
        //     // const textPath = document.createElementNS("https://www.w3.org/2000/svg", "textPath");

        //     text.innerHTML = renderMap.label

        //     const {start,end } = renderMap

        //     const {pos,angle} = calculateLabelPostion(start,end);

        //     const angleDegrees = angle !== 0 ? (Math.PI / angle) : 0

        //     text.setAttribute("x", pos[0])
        //     text.setAttribute("y", pos[1])

        //     text.setAttribute("transform", `rotate(${angleDegrees} ${pos[0]} ${pos[1]})`)
        //     // text.setAttribute("rotate","30");
            
        //     // textPath.setAttribute("href", "#" + index);




        //     // textPath.innerHTML="LABEL"

        //     // text.appendChild(textPath);

        //     renderElement.appendChild(text)
        // }

        renderElement.appendChild(line)
    })

}