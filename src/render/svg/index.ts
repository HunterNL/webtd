import { vec2 } from "gl-matrix";
import { Entity } from "../../interfaces/entity";
import { isBuffer } from "../../obj/physical/buffer";
import { isSwitch } from "../../obj/physical/switch";
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

    if(isBuffer(ent) || isSwitch(ent)) {
        if(ent.renderData?.position) {
            return ent.renderData.position
        }
    }

    return undefined;
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