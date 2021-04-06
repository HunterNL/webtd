import { Entity } from "../interfaces/entity";
import { WorldBuilder } from "../util/worldBuilder"
import { Ride } from "./ride";
import { lookupSignals, Signal } from "./signal";

function createWorld(): [Entity[],Signal, Ride] {
    const wb = new WorldBuilder();
    const [startBuffer,endBuffer] = [wb.addBuffer(),wb.addBuffer()];

    const track = wb.addTrack(startBuffer, endBuffer, 1000);
    const signal = wb.addSignal(track, 300);

    const train = wb.addTrain(100);
    const ride = wb.addRide({
        position: {
            offset: 200,
            track
        },
        train,
        speed: 0,
        targetSpeed: 0,
    })

    

    return [wb.getEntities(),signal,ride]
}



describe('Rail way signal',() => {
    test("Can be spotted by a ride",function() {
        const [entities, signal, ride] = createWorld();

        expect(lookupSignals(entities, ride, 200)).toEqual([signal]);
    })
    test("Doesn't see signals beyond search distance",function() {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const [entities, signal, ride] = createWorld();

        expect(lookupSignals(entities, ride, 5)).toEqual([]);
    })

    test("Doesn't see signals behind the train head",function() {
        const [entities, signal, ride] = createWorld();

        signal.position.offset = 95;

        expect(lookupSignals(entities, ride, 200)).toEqual([]);
    })
})