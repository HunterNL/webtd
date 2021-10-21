import { flatten } from "lodash";
import exampleEnvironment from "./data/map.json";
import { DynamicEnvironment, loadEnvironment } from "./obj/environment";
import { createGameLoop } from "./obj/gameloop";
import { doSegmentsOverlap } from "./obj/trackSegment";
import { SVGRenderer } from "./render/index";

const LOOP_INTERVAL = 500;//ms

const env = loadEnvironment(exampleEnvironment);
const dynamicEnvironment: DynamicEnvironment = {
    occupiedTrackSegments: [],
    switchPositions: env.switches
}

console.log(env, dynamicEnvironment);


function createRafFunction(renderer: SVGRenderer) {
    const onRAF = function() {
        renderer.render(dynamicEnvironment)
        window.requestAnimationFrame(onRAF);
    }

    return onRAF;
}

function onDomReady() {
    const renderElement = document.getElementById("gamecontainer");

    if(!renderElement) {
        throw new Error("renderElement not found!");
    }

    if(!(renderElement instanceof SVGElement)) {
        throw new Error("RenderElement is not an SVGElement");
    }

    const renderer = new SVGRenderer(env, renderElement)
    renderer.render(dynamicEnvironment);

    const raf = createRafFunction(renderer);

    window.requestAnimationFrame(raf);


    const {start} = createGameLoop(env.entities, LOOP_INTERVAL, () => {
        const tracks = env.tracks;
        const rides = env.rides;

        const allSegments = flatten(tracks.map(track => track.segments.detection));

        const rideSegments = flatten(rides.map(ride => ride.span.segments));

        const newOccupiedTrackSegments = allSegments.filter(segmentA => rideSegments.some(segmentB => doSegmentsOverlap(segmentA, segmentB)))

        dynamicEnvironment.occupiedTrackSegments.length = 0;
        dynamicEnvironment.occupiedTrackSegments.push(...newOccupiedTrackSegments); // TODO not this
    })

    start();
}

document.addEventListener("DOMContentLoaded", onDomReady);