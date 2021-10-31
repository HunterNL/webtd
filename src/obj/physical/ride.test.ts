import { Entity } from "../../interfaces/entity";
import { WorldBuilder } from "../../util/worldBuilder";
import { Driveable } from "./driver";
import { moveRide, Ride, updateRide } from "./ride";
import { Direction, DIRECTION_BACKWARD, DIRECTION_FORWARD } from "./situation";
import { Track } from "./track";

function createSimpleWorld(postition: number, length: number, forwardDirection: Direction): [Entity[], Ride] {
    const wb = new WorldBuilder();
    const [sb, eb] = [wb.addBuffer(), wb.addBuffer()];
    const track = wb.addTrack(sb, eb, 500);
    const train = wb.addTrain(length);
    const ride = wb.addRide({
        train,
        position: {
            track,
            offset: postition
        },
        direction: forwardDirection,
    })

    return [wb.getEntities(), ride];
}

function createDriverWorld(): [Entity[], Ride] {
    const wb = new WorldBuilder();
    const [ba, bb] = [wb.addBuffer(), wb.addBuffer()];

    const track = wb.addTrack(ba, bb, 5000);

    const train = wb.addTrain(500);

    const ride = wb.addRide({ train, position: { offset: 500, track }, driverMode: { type: "maintain_speed", "targetSpeed": 0 } })

    return [wb.getEntities(), ride];
}

function createSwitchWorld(direction: Direction): [Entity[], Ride] {
    const wb = new WorldBuilder();
    const [sb, eb] = [wb.addBuffer(), wb.addBuffer()];
    const trackSwitch = wb.addSwitch();

    // Worldborder method order determines id, sensitive for testing!
    const firstTrack = wb.addTrack(sb, trackSwitch, 10);
    const secondTrack = wb.addTrack(eb, trackSwitch, 10);


    const train = wb.addTrain(4)

    wb.setJunction(trackSwitch.id, {
        sideConnections: [],
        straightConnections: [[firstTrack.id, secondTrack.id]]
    })

    const ride = wb.addRide({
        position: {
            track: firstTrack,
            offset: 9
        },
        train,
        direction,
    })



    return [wb.getEntities(), ride]
}

// Position, length, direction, expectedForwardPosition, expectedBackPosition
const spawningTest = [
    [250, 50, DIRECTION_FORWARD, 250, 200],
    [250, 50, DIRECTION_BACKWARD, 250, 300]
]

// Position, length, spawn direction, movements, expectedForwardPosition, expectedBackPosition
const simpleMovementTests = [
    //Forward 
    [250, 50, DIRECTION_FORWARD, [1], 251, 201],
    [250, 50, DIRECTION_FORWARD, [1, 1], 252, 202],
    [250, 50, DIRECTION_FORWARD, [2], 252, 202],
    [250, 50, DIRECTION_BACKWARD, [1], 249, 299],
    [250, 50, DIRECTION_BACKWARD, [1, 1], 248, 298],
    [250, 50, DIRECTION_BACKWARD, [2], 248, 298],

    //Backward
    [250, 50, DIRECTION_FORWARD, [-1], 249, 199],
    [250, 50, DIRECTION_FORWARD, [-1, -1], 248, 198],
    [250, 50, DIRECTION_FORWARD, [-2], 248, 198],

    //Combined, starting forward
    [250, 50, DIRECTION_FORWARD, [-1, 2], 251, 201],
    [250, 50, DIRECTION_FORWARD, [-1, 2, -1], 250, 200],
    [250, 50, DIRECTION_FORWARD, [-1, 2, -1, 5], 255, 205],
    [250, 50, DIRECTION_FORWARD, [-1, 2, -1, 5, -2], 253, 203],

    //Combined, starting backward
    [250, 50, DIRECTION_BACKWARD, [1], 249, 299],
    [250, 50, DIRECTION_BACKWARD, [1, -2, -2], 253, 303],
    [250, 50, DIRECTION_BACKWARD, [1, -2, -2, 10], 243, 293],
]

// Spawn direction, movement, front[trackId,offset], end[trackId,offset]
// All start at [3,9], length of 4
const switchMovementTests = [
    [DIRECTION_FORWARD,[2],[4,9],[3,7]],
    [DIRECTION_FORWARD,[-2],[3,7],[3,3]],
    [DIRECTION_FORWARD,[-2,4],[4,9],[3,7]],

    [DIRECTION_FORWARD,[10],[4,1],[4,5]],
    [DIRECTION_FORWARD,[10,-10,],[3,9],[3,5]],
    [DIRECTION_FORWARD,[10,-10,-1],[3,8],[3,4]],

    [DIRECTION_BACKWARD,[],[3,9],[4,7]],
    [DIRECTION_BACKWARD,[1],[3,8],[4,8]],
    [DIRECTION_BACKWARD,[-1],[3,10],[4,6]],
    [DIRECTION_BACKWARD,[3],[3,6],[3,10]],
    [DIRECTION_BACKWARD,[3,-1],[3,7],[4,9]],
    [DIRECTION_BACKWARD,[5],[3,4],[3,8]],
    [DIRECTION_BACKWARD,[5,-8],[4,8],[4,4]]
]

describe('Ride', () => {

    describe('Initial span', () => {

        test.each(spawningTest)("Spawns in the right place", (offset, len, direction, expectedForward, expectedBackward) => {
            const [entities, ride] = createSimpleWorld(offset, len, direction);

            const { endPosition, startPosition } = ride.span

            expect(startPosition.offset).toEqual(expectedForward);
            expect(endPosition.offset).toEqual(expectedBackward);
        })

        test("Spawn facing forward", () => {
            const [entities, ride] = createSimpleWorld(250, 50, DIRECTION_FORWARD);
            expect(ride.span.finalDirection).toEqual(DIRECTION_FORWARD)
        })
        test("Spawn facing Backward", () => {
            const [entities, ride] = createSimpleWorld(250, 50, DIRECTION_BACKWARD);
            expect(ride.span.finalDirection).toEqual(DIRECTION_BACKWARD)
        })

        test("Errors if spawn off-track", () => {
            expect(() => createSimpleWorld(100, 150, DIRECTION_FORWARD)).toThrowError("Failed to create train span, train derailed?")
        })
        test("Errors if spawn off-track (reversed)", () => {
            expect(() => createSimpleWorld(400, 150, DIRECTION_BACKWARD)).toThrowError("Failed to create train span, train derailed?")
        })
    })

    describe("Movement", () => {
        test.each(simpleMovementTests)("Movement across track %#", (offset, length, direction, movements, expectedForwardPosition, expectedBackPosition) => {
            // test("Movement across plain track", () => {
                const [entities, ride] = createSimpleWorld(offset, length, direction);

                movements.forEach((n: number) => {
                    moveRide(entities, ride, n);
                });

                const { startPosition, endPosition } = ride.span;

                expect(startPosition.offset).toEqual(expectedForwardPosition);
                expect(endPosition.offset).toEqual(expectedBackPosition);

            // })
        });

        test.each(switchMovementTests)("Movement across switch #%# %d %j %j %j", (spawnDirection,movement,expectedFront, expectedBack) => {
            const [entities, ride] = createSwitchWorld(spawnDirection)

            movement.forEach((n: number) => {
                moveRide(entities, ride,n)
            });

            const { startPosition, endPosition } = ride.span;
            
            expect(startPosition.track.id).toEqual(expectedFront[0])
            expect(startPosition.offset).toEqual(expectedFront[1])

            expect(endPosition.track.id).toEqual(expectedBack[0])
            expect(endPosition.offset).toEqual(expectedBack[1])
        })
    })


    describe('Acceleration', () => {

        test("Acceleration should be applied to speed over time", () => {
            const [entities, ride] = createDriverWorld() as [Entity[], Ride & Driveable];
            ride.speed = 0;
            (ride.driverMode as any).targetSpeed = 10

            updateRide(entities, ride, 1);

            expect(ride.speed).toBeCloseTo(0.35);
        })
        test("Acceleration should not exceed target speed ", () => {
            const [entities, ride] = createDriverWorld() as [Entity[], Ride & Driveable];
            ride.speed = 0;
            (ride.driverMode as any).targetSpeed = 0.1; // TODO Fix types

            updateRide(entities, ride, 1);

            expect(ride.speed).toBe(0.1);
        })
        test("Acceleration should work for braking ", () => {
            const [entities, ride] = createDriverWorld() as [Entity[], Ride & Driveable];
            (ride.driverMode as any).targetSpeed = 0; // TODO Fix types
            ride.speed = 10;

            updateRide(entities, ride, 1);

            expect(ride.speed).toBeCloseTo(9.65);
        })
        test("Acceleration should work for braking ", () => {
            const [entities, ride] = createDriverWorld() as [Entity[], Ride & Driveable];
            (ride.driverMode as any).targetSpeed = 0; // TODO Fix types
            ride.speed = 0.1

            updateRide(entities, ride, 1);

            expect(ride.speed).toBe(0);
        })
    })
})