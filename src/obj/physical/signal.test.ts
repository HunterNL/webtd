import { Entity } from "../../interfaces/entity";
import { WorldBuilder } from "../../util/worldBuilder";
import { Ride } from "./ride";
import { lookupSignals, Signal } from "./signal";
import { TrackWeld } from "./track";

function createWorld(signalOffset?: number): [Entity[],Signal, Ride] {
    const wb = new WorldBuilder();
    const [startBuffer,endBuffer] = wb.addBuffer(2);

    const weld : TrackWeld = {
        position: 700,
        signalIds: [3], // NOTE sensitive to re-ordering!,
        type: "weld",
    }

    const track = wb.addTrack(startBuffer, endBuffer, 1000,[weld]);
    const signal = wb.addSignal(track, signalOffset);

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
    
    describe('Detection',() => {
        test("Can be spotted by a ride",function() {
            const [entities, signal, ride] = createWorld(250);
            debugger
            const signals = lookupSignals(entities, ride, 200)
    
            expect(signals).toHaveLength(1)
            expect(signals[0]).toBe(signal);

        })
        test("Doesn't see signals beyond search distance",function() {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const [entities, signal, ride] = createWorld(600);
    
            expect(lookupSignals(entities, ride, 200)).toHaveLength(0);
        })
    
        test("Doesn't see signals behind the train head",function() {
            const [entities, signal, ride] = createWorld(195);
    
            expect(lookupSignals(entities, ride, 200)).toHaveLength(0);
        })
    })

    describe('Positioning',() => {
        test("Gets position from linked trackFeature",() => {
            const [entities, signal, ride] = createWorld();

            expect(signal.position.offset).toBe(700)

            expect(signal.snappedToWeld).toBe(true);
        })
    })
})