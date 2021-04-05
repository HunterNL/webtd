import { Entity } from "../interfaces/entity";
import { WorldBuilder } from "../util/worldBuilder";
import { Ride, updateRide } from "./ride";

function createWorld(): [Entity[], Ride] {
    const wb = new WorldBuilder();
    const [ba,bb] = [wb.addBuffer(),wb.addBuffer()];

    const track = wb.addTrack(ba, bb, 5000);

    const train = wb.addTrain(500);

    const ride = wb.addRide({train,position: {offset:500,track}})

    return [wb.getEntities(),ride];
}

describe('Ride',() => {



    describe('Acceleration',() => {

        test("Acceleration should be applied to speed over time", () => {
            const [entities,ride] = createWorld();
            ride.speed = 0;
            ride.targetSpeed = 10

            updateRide(entities, ride, 1);

            expect(ride.speed).toBeCloseTo(0.35);
        })
        test("Acceleration should not exceed target speed ", () => {
            const [entities,ride] = createWorld();
            ride.speed = 0;
            ride.targetSpeed = 0.1;

            updateRide(entities, ride, 1);

            expect(ride.speed).toBe(0.1);
        })
        test("Acceleration should work for braking ", () => {
            const [entities,ride] = createWorld();
            ride.targetSpeed = 0;
            ride.speed = 10;

            updateRide(entities, ride, 1);

            expect(ride.speed).toBeCloseTo(9.65);
        })
        test("Acceleration should work for braking ", () => {
            const [entities,ride] = createWorld();
            ride.targetSpeed = 0;
            ride.speed = 0.1

            updateRide(entities, ride, 1);

            expect(ride.speed).toBe(0);
        })
    })
})