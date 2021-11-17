import { vec2 } from "gl-matrix";
import { Entity } from "../../interfaces/entity";
import { isTrack, trackGetRenderPath } from "../../obj/physical/track";
import { pathGetTextPos } from "../trackRenderer";

export function createSVGElement<K extends keyof SVGElementTagNameMap>(elementName: K, id?: string): SVGElementTagNameMap[K] {
    const el = document.createElementNS("http://www.w3.org/2000/svg", elementName);
    if(id) el.setAttribute("id", id);
    return el
}

function getDebugIdPos(ent: Entity): vec2 | undefined {
    if(isTrack(ent)) {
        return pathGetTextPos(trackGetRenderPath(ent));
    }

    const position = vec2.create();

    if(ent?.renderData?.start && ent.renderData.end) {
        return vec2.lerp(position,ent.renderData.start,ent.renderData.end,0.5);
    } else if (ent?.renderData?.position) {
        return vec2.copy(position, ent.renderData.position);
    } else {
        return undefined;
    }
}

export function renderDebugIds(entities: Entity[], containingElement: SVGGElement) {
    entities.forEach(ent => {        
        const position = getDebugIdPos(ent)
        if(typeof position === "undefined"){
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