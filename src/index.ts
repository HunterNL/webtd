import exampleEnvironment from "./data/map.json";
import { loadEnvironment } from "./obj/environment";
import { createGameLoop } from "./obj/gameloop";
import { renderEnv } from "./render/index";


const env = loadEnvironment(exampleEnvironment);

function onDomReady() {
    const renderElement = document.getElementById("gamecontainer");

    
    if(!renderElement) {
        throw new Error("renderElement not found!");
    }

    const {start} = createGameLoop(env.entities, 1000, () => {
        renderEnv(env ,renderElement as any);
    })

    start();
}

document.addEventListener("DOMContentLoaded", onDomReady);