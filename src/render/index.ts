import { Environment } from "../obj/environment";
import { Entity, getEntityById, isEntity } from "../interfaces/entity";
import { Track, situationIsOnTrack, trackIsOccupied, isTrack, resolveBoundries } from "../obj/track";
import { getSpanningTracks } from "../obj/ride";
import { flatten } from "lodash";
import { getId } from "../interfaces/id";
import { vec2 } from "gl-matrix";

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

function isTrackOccupied(trackId: number, occupiedTracksIds: number[]) {
    return occupiedTracksIds.includes(trackId);
}

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

function renderTracks(tracks: Track[],occupiedTrackIds: number[], containingElement: SVGElement) {

    tracks.forEach((track: Track ,index) => {
        const [startBoundry, endBoundry] = track.boundries;

        if(!startBoundry.renderData || !endBoundry.renderData) {
            throw new Error("Boundry lacks renderData");
        }


        if(!startBoundry.renderData.position || !endBoundry.renderData.position) {
            throw new Error("Boundry lacks proper renderData");
        }

        const startPos = startBoundry.renderData.position;
        const endPos = endBoundry.renderData.position;


        const line: SVGElement = document.createElementNS("http://www.w3.org/2000/svg","line");
        line.setAttribute("x1", ""+ startPos[0])
        line.setAttribute("y1", ""+ startPos[1])
        line.setAttribute("x2", ""+ endPos[0])
        line.setAttribute("y2", ""+ endPos[1])
        line.setAttribute("stroke", getColorForOccupationStatus(isTrackOccupied(track.id, occupiedTrackIds)))
        line.setAttribute("id", "" + index);

        // if(isTrack(ent) && ent.segments.length > 0) {
            track.segments.forEach(segment => {
                [segment.end,segment.end].forEach(segmentPoint => {
                    const pos = segmentPoint/track.length;

                    const DIVIDER_LENGTH = 8;

                    const basePos = vec2.lerp(vec2.create(),startPos,endPos,pos);
                    const normal = getLineNormal(startPos,endPos);

                    const posA = vec2.scaleAndAdd(vec2.create(),basePos,normal,DIVIDER_LENGTH)
                    const posB = vec2.scaleAndAdd(vec2.create(),basePos,normal,-DIVIDER_LENGTH)


                    const line: SVGElement = document.createElementNS("http://www.w3.org/2000/svg","line");
                    line.setAttribute("x1", ""+ posA[0])
                    line.setAttribute("y1", ""+ posA[1])
                    line.setAttribute("x2", ""+ posB[0])
                    line.setAttribute("y2", ""+ posB[1])
                    line.setAttribute("stroke", COLOR_UNOCCUPIED),
                    line.setAttribute("stroke-width", "1.5"),

                    line.setAttribute("id", "" + index);
                    containingElement.appendChild(line);
                })
            })

            containingElement.appendChild(line);
    })
}

export function renderEnv(env: Environment,renderElement: SVGElement) {
    renderElement.childNodes.forEach(child => renderElement.removeChild(child));

    const trackGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
    const textGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");

    const occupiedTracksArray = env.rides.map(ride => getSpanningTracks(env.entities,ride));
    const occupiedTracksIds = flatten(occupiedTracksArray).map(getId);


    renderDebugIds(env.entities, textGroup)
    renderTracks(env.tracks, occupiedTracksIds, trackGroup)

    renderElement.appendChild(trackGroup);
    renderElement.appendChild(textGroup);

}