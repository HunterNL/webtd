import { Entity } from "../interfaces/entity";
import { WorldBuilder } from "../util/worldBuilder";
import { Driveable } from "./driver";
import { Ride, updateRide } from "./ride";

function createWorld(): [Entity[], Ride] {
    const wb = new WorldBuilder();
    const [ba,bb] = [wb.addBuffer(),wb.addBuffer()];

    const track = wb.addTrack(ba, bb, 5000);

    const train = wb.addTrain(500);

    const ride = wb.addRide({train,position: {offset:500,track},driverMode: {type:"maintain_speed","targetSpeed":0}})

    return [wb.getEntities(),ride];
}

describe('Ride',() => {



    describe('Acceleration',() => {

        test("Acceleration should be applied to speed over time", () => {
            const [entities,ride] = createWorld() as [Entity[], Ride & Driveable];
            ride.speed = 0;
            (ride.driverMode as any).targetSpeed = 10

            updateRide(entities, ride, 1);

            expect(ride.speed).toBeCloseTo(0.35);
        })
        test("Acceleration should not exceed target speed ", () => {
            const [entities,ride] = createWorld() as [Entity[], Ride & Driveable];
            ride.speed = 0;
            (ride.driverMode as any).targetSpeed = 0.1; // TODO Fix types

            updateRide(entities, ride, 1);

            expect(ride.speed).toBe(0.1);
        })
        test("Acceleration should work for braking ", () => {
            const [entities,ride] = createWorld() as [Entity[], Ride & Driveable];
            (ride.driverMode as any).targetSpeed = 0; // TODO Fix types
            ride.speed = 10;

            updateRide(entities, ride, 1);

            expect(ride.speed).toBeCloseTo(9.65);
        })
        test("Acceleration should work for braking ", () => {
            const [entities,ride] = createWorld() as [Entity[], Ride & Driveable];
            (ride.driverMode as any).targetSpeed = 0; // TODO Fix types
            ride.speed = 0.1

            updateRide(entities, ride, 1);

            expect(ride.speed).toBe(0);
        })
    })
})