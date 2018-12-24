import exampleEnvironment from "./data/map.json";
import renderMap from "./data/rendermap.json";
import { isObject } from "./util/isObject.js";
import { Environment, loadEnvironment } from "./obj/environment";
import { renderEnv } from "./render/index";
import { createGameLoop } from "./obj/gameloop";


const env = loadEnvironment(exampleEnvironment);

console.log(5,env.rides)

function onDomReady() {
    const renderElement = document.getElementById("gamecontainer");

    
    if(!renderElement) {
        throw new Error("renderElement not found!");
    }

    const {start, stop } = createGameLoop(env.entities, 1000, () => {
        renderEnv(env,renderMap.renderMap as any,renderElement as any);
    })

    start();
}

document.addEventListener("DOMContentLoaded", onDomReady);