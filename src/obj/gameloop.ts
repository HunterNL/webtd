import { Entity } from "../interfaces/entity";
import { isTrain } from "./train";
import { isRide, updateRide } from "./ride";
import { isUpdateable } from "../interfaces/updateAble";

export function createGameLoop(entities: Entity[],updateInterval:number,postUpdate: (dt:number,entities:Entity[]) => any) {
    let lastLoopTime: number
    let intervalHandle: number;


    function loop(dt: number) {
        console.log("Loop start")
        entities.filter(isRide).forEach(ride => updateRide(entities,ride,dt))
    }

    function loopWrapper() {
        const currentDate = Date.now();
        const dt = currentDate - lastLoopTime;
        lastLoopTime = currentDate;
        loop(dt);
        postUpdate(dt,entities);
    }


    function start() {
        lastLoopTime = Date.now();
        intervalHandle = window.setInterval(loopWrapper,updateInterval)
    }

    function stop() {
        window.clearInterval(intervalHandle);
    }

    return {
        start,stop
    }
}