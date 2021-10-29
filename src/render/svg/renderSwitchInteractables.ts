import { TrackSwitch, throwSwitch } from "../../obj/physical/switch";
import { requireRenderPosition } from "./switchRenderer";
import { COLOR_UNOCCUPIED } from "../index";
import { createSVGElement } from ".";


export function renderSwitchInteractables(switches: TrackSwitch[], interactableGroup: SVGGElement) {
    switches.forEach(trackSwitch => {
        const circle = createSVGElement("circle");
        const renderPos = requireRenderPosition(trackSwitch);


        circle.setAttribute("cx", renderPos[0] + "");
        circle.setAttribute("cy", renderPos[1] + "");
        circle.setAttribute("r", "10");
        circle.setAttribute("fill", "none");
        circle.setAttribute("stroke-width", "1");
        circle.setAttribute("stroke", COLOR_UNOCCUPIED);
        circle.setAttribute("opacity", ".3");
        circle.setAttribute("pointer-events", "bounding-box");

        circle.addEventListener("click", () => {
            throwSwitch(trackSwitch);
        });


        interactableGroup.appendChild(circle);
    });
}
