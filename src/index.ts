import { flatten } from "lodash";
import exampleEnvironment from "./data/map.json";
import { loadEnvironment } from "./obj/environment";
import { createGameLoop } from "./obj/gameloop";
import { doSegmentsOverlap } from "./obj/trackSegment";
import { SVGRenderer } from "./render/index";


const env = loadEnvironment(exampleEnvironment);

function onDomReady() {
    const renderElement = document.getElementById("gamecontainer");

    if(!renderElement) {
        throw new Error("renderElement not found!");
    }

    if(!(renderElement instanceof SVGElement)) {
        throw new Error("RenderElement is not an SVGElement");
    }

    const renderer = new SVGRenderer(env, renderElement)

    const {start} = createGameLoop(env.entities, 1000, () => {
        const tracks = env.tracks;
        const rides = env.rides;

        const allSegments = flatten(tracks.map(track => track.segments.detection));

        const rideSegments = flatten(rides.map(ride => ride.span.segments));

        const occupiedTrackSegments = allSegments.filter(segmentA => rideSegments.some(segmentB => doSegmentsOverlap(segmentA, segmentB)))

        const switches = env.switches

        renderer.render({
            occupiedTrackSegments,
            switchPositions: switches
        });
        // renderEnv(env ,renderElement as any);
    })

    start();
}

document.addEventListener("DOMContentLoaded", onDomReady);