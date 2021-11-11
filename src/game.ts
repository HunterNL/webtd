import { flatten } from "lodash";
import exampleEnvironment from "./data/map.json";
import { DynamicEnvironment, loadEnvironment } from "./obj/environment";
import { createGameLoop } from "./obj/gameloop";
import { updateRide } from "./obj/physical/ride";
import { doSegmentsOverlap } from "./obj/physical/trackSegment";
import { SVGRenderer } from "./render/svg/SVGRenderer";

const LOOP_INTERVAL = 500;//ms

const TIMESCALE = 1;

const env = loadEnvironment(exampleEnvironment);
const dynamicEnvironment: DynamicEnvironment = {
    occupiedTrackSegments: [],
    switchPositions: env.switches,
    occupationMap: new Map()
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
    const rideList = document.getElementById("ridecontainer");

    if(!renderElement) {
        throw new Error("renderElement not found!");
    }

    if(!(renderElement instanceof SVGElement)) {
        throw new Error("RenderElement is not an SVGElement");
    }

    if(!rideList) {
        throw new Error("Ridelist not found");
    }

    if(!(rideList instanceof HTMLDivElement)) {
        throw new Error("RideList not a Div");
        
    }

    const renderer = new SVGRenderer(env, {
        svgElement: renderElement,
        html: rideList
    })
    renderer.render(dynamicEnvironment);

    const raf = createRafFunction(renderer);

    window.requestAnimationFrame(raf);


    const {start} = createGameLoop(LOOP_INTERVAL, (dt) => {
        const tracks = env.tracks;
        const rides = env.rides;

        rides.forEach(ride => updateRide(env.entities,ride,dt*TIMESCALE))

        dynamicEnvironment.occupationMap.clear();

        const allSegments = flatten(tracks.map(track => track.segments.detection));

        rides.forEach(ride => {
            const {span} = ride
            const rideSegment = span.segments;

            rideSegment.forEach(rideSegment => {
                allSegments.forEach(trackSegment => {
                    if(doSegmentsOverlap(rideSegment, trackSegment)) {
                        dynamicEnvironment.occupationMap.set(trackSegment, ride);
                    }
                })
            })
        })



        // TODO deduplicate, remove code below
        const rideSegments = flatten(rides.map(ride => ride.span.segments));
        const newOccupiedTrackSegments = allSegments.filter(segmentA => rideSegments.some(segmentB => doSegmentsOverlap(segmentA, segmentB)))

        dynamicEnvironment.occupiedTrackSegments.length = 0;
        dynamicEnvironment.occupiedTrackSegments.push(...newOccupiedTrackSegments); // TODO not this
    })

    start();
}

document.addEventListener("DOMContentLoaded", onDomReady);