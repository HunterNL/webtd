import exampleEnvironment from "./data/map.json";
import renderMap from "./data/rendermap.json";
import { isObject } from "./util/isObject.js";
import { Environment, loadEnvironment } from "./obj/environment";
import { renderEnv } from "./render/index";


const env = loadEnvironment(exampleEnvironment);

function onDomReady() {
    const renderElement = document.getElementById("gamecontainer");

    
    if(!renderElement) {
        throw new Error("renderElement not found!");
    }

    renderEnv(env,renderMap.renderMap as any,renderElement as any);
}

document.addEventListener("DOMContentLoaded", onDomReady);