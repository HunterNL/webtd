import { vec2 } from "gl-matrix";
import { Entity } from "../../interfaces/entity";

export function createSVGElement<K extends keyof SVGElementTagNameMap>(elementName: K): SVGElementTagNameMap[K] {
    return document.createElementNS("http://www.w3.org/2000/svg", elementName);
}

export function renderDebugIds(entities: Entity[], containingElement: SVGGElement) {
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