import { Entity } from "../../interfaces/entity";
import { WorldBuilder } from "../../util/worldBuilder";
import { Track } from "./track";
import { advanceAlongTrack, TrackPosition } from "./situation";
import { TrackSegment } from "./trackSegment";

// Simple 1 track
/*
    ┌─────────────────────────────────────────────┐
    │                                             │
    │  B──────────────────────────────────────B   │
    │  0                                     10   │
    │                                             │
    └─────────────────────────────────────────────┘
    */

function createSimpleWorld(): Track {
    const wb = new WorldBuilder();

    const [start, end] = wb.addBuffer(2);

    const track = wb.addTrack(start, end, 10);

    return track;
}

/*
    ┌─────────────────────────────────────────────┐
    │                                             │
    │                          SideTrack          │
    │                       ┌─────────────────B   │
    │                       │                10   │
    │                       │                     │
    │    EntryTrack         │0  StraightTrack     │
    │  B────────────────────S─────────────────B   │
    │  0                  10|0               10   │
    │                                             │
    └─────────────────────────────────────────────┘
    */
function createSwitchWorld(): [Entity[], Track, Track, Track] {
    const wb = new WorldBuilder();

    const [start, endTop, endBottom] = wb.addBuffer(3);
    const trackSwitch = wb.addSwitch();

    const entryTrack = wb.addTrack(start, trackSwitch, 10);
    const straightTrack = wb.addTrack(trackSwitch, endTop, 10);
    const sideTrack = wb.addTrack(trackSwitch, endBottom, 10);

    wb.setJunction(trackSwitch.id, {
        straightConnections: [[entryTrack.id, straightTrack.id]],
        sideConnections: [[entryTrack.id, sideTrack.id]],
    });

    return [wb.getEntities(), entryTrack, straightTrack, sideTrack];
}

/*
┌─────────────────────────────────────────────┐
│                                             │
│                          SideTrack          │
│                       ┌─────────────────B   │
│                       │                10   │
│                       │                     │
│    EntryTrack         │0  StraightTrack     │
│  B────────────────────S─────────────────B   │
│  0                  10|10               0   │
│                        !!                   │
└─────────────────────────────────────────────┘
*/

function createReverseSwitchWorld(): [Entity[], Track, Track, Track] {
    const wb = new WorldBuilder();

    const [start, endTop, endBottom] = wb.addBuffer(3);
    const trackSwitch = wb.addSwitch();

    const entryTrack = wb.addTrack(start, trackSwitch, 10);
    const straightTrack = wb.addTrack(endBottom, trackSwitch, 10);
    const sideTrack = wb.addTrack(trackSwitch, endTop, 10);

    wb.setJunction(trackSwitch.id, {
        straightConnections: [[entryTrack.id, straightTrack.id]],
        sideConnections: [[entryTrack.id, sideTrack.id]],
    });

    return [wb.getEntities(), entryTrack, straightTrack, sideTrack];
}

describe("advanceAlongTrack", () => {
    describe("Single track piece", function () {
        describe("Advanding forward", () => {
            test("TrackPostion can correctly advance forward", function () {
                const simpleTrack = createSimpleWorld();
                const position: TrackPosition = { offset: 0, track: simpleTrack };

                const [span] = advanceAlongTrack([simpleTrack], position, 1);

                expect(span.endPosition.offset).toBe(1);
            });

            test("Segment contains only 1 entry", () => {
                const simpleTrack = createSimpleWorld();
                const position: TrackPosition = { offset: 0, track: simpleTrack };

                const [span] = advanceAlongTrack([simpleTrack], position, 1);

                expect(span.segments).toHaveLength(1);
            });

            test("Segment contains expected span", () => {
                const simpleTrack = createSimpleWorld();
                const position: TrackPosition = { offset: 0, track: simpleTrack };

                const [span] = advanceAlongTrack([simpleTrack], position, 1);

                const segment: TrackSegment = span.segments[0];

                expect(segment).toEqual({
                    trackId: simpleTrack.id,
                    start: 0,
                    end: 1,
                });
            });

            test("TrackPostion can advance into a buffer and crash", function () {
                const simpleTrack = createSimpleWorld();
                const position: TrackPosition = { offset: 1, track: simpleTrack };

                const [, didComplete] = advanceAlongTrack([simpleTrack], position, 10);
                expect(didComplete).toBe(false);
            });
        });
        describe("Advancing backward", () => {
            test("TrackPostion ends up in the right place", function () {
                const simpleTrack = createSimpleWorld();
                const position: TrackPosition = { offset: 5, track: simpleTrack };

                const [span] = advanceAlongTrack([simpleTrack], position, -1);

                expect(span.endPosition.offset).toBe(4);
            });

            test("Segment contains only 1 entry", () => {
                const simpleTrack = createSimpleWorld();
                const position: TrackPosition = { offset: 5, track: simpleTrack };

                const [span] = advanceAlongTrack([simpleTrack], position, -1);

                expect(span.segments).toHaveLength(1);
            });

            test("Segment contains expected span", () => {
                const simpleTrack = createSimpleWorld();
                const position: TrackPosition = { offset: 5, track: simpleTrack };

                const [span] = advanceAlongTrack([simpleTrack], position, -1);

                const segment: TrackSegment = span.segments[0];

                expect(segment).toEqual({
                    trackId: simpleTrack.id,
                    start: 5,
                    end: 4,
                });
            });

            test("TrackPostion can advance into a buffer and crash", function () {
                const simpleTrack = createSimpleWorld();
                const position: TrackPosition = { offset: 1, track: simpleTrack };

                const [, didComplete] = advanceAlongTrack([simpleTrack], position, -2);
                expect(didComplete).toBe(false);
            });
        });
    });

    describe("Simple switch layout", function () {
        describe("Advancing forward", () => {
            test("TrackPosition ends up in the right place", function () {
                const [allEntities, entryTrack, straightTrack] = createSwitchWorld();

                const position: TrackPosition = { offset: 8, track: entryTrack };

                const [span] = advanceAlongTrack(allEntities, position, 4);

                expect(span.endPosition.offset).toBe(2);
                expect(span.endPosition.track).toBe(straightTrack);
            });

            test("Correct segments are created", function () {
                const [allEntities, entryTrack, straightTrack] = createSwitchWorld();

                const position: TrackPosition = { offset: 8, track: entryTrack };

                const [span] = advanceAlongTrack(allEntities, position, 4);

                expect(span.segments).toHaveLength(2);
                const [firstSegment, secondSegment] = span.segments;

                expect(firstSegment).toEqual({
                    trackId: entryTrack.id,
                    start: 8,
                    end: 10,
                });

                expect(secondSegment).toEqual({
                    trackId: straightTrack.id,
                    start: 0,
                    end: 2,
                });
            });
        });

        describe("Advancing backwards", () => {
            test("TrackPosition ends up in the right place", function () {
                const [allEntities, entryTrack, straightTrack] = createSwitchWorld();
                const position: TrackPosition = { offset: 3, track: straightTrack };

                const [span] = advanceAlongTrack(allEntities, position, -5);

                expect(span.endPosition.offset).toBe(8);
                expect(span.endPosition.track).toBe(entryTrack);
            });
            test("Correct segments are created", function () {
                const [allEntities, entryTrack, straightTrack] = createSwitchWorld();
                const position: TrackPosition = { offset: 3, track: straightTrack };

                const [span] = advanceAlongTrack(allEntities, position, -5);

                expect(span.segments).toHaveLength(2);

                const [firstSegment, secondSegment] = span.segments;

                expect(firstSegment.trackId).toBe(straightTrack.id);
                expect(firstSegment.start).toBe(3);
                expect(firstSegment.end).toBe(0);

                expect(secondSegment.trackId).toBe(entryTrack.id);
                expect(secondSegment.start).toBe(10); // Track length
                expect(secondSegment.end).toBe(8);
            });
        });
    });

    describe("Reverse exit track", function () {
        describe("Advancing forward", () => {
            test("TrackPosition ends up in the right place", function () {
                const [
                    allEntities,
                    entryTrack,
                    straightTrack,
                ] = createReverseSwitchWorld();

                const position: TrackPosition = { offset: 8, track: entryTrack };

                const [span, didComplete] = advanceAlongTrack(allEntities, position, 4);
                expect(didComplete).toBeTruthy();

                expect(span.endPosition.offset).toBe(8);
                expect(span.endPosition.track).toBe(straightTrack);
            });
            test("Correct segments are created", function () {
                const [
                    allEntities,
                    entryTrack,
                    straightTrack,
                ] = createReverseSwitchWorld();

                const position: TrackPosition = { offset: 8, track: entryTrack };

                const [span] = advanceAlongTrack(allEntities, position, 4);

                expect(span.segments).toHaveLength(2);

                const [firstSegment, secondSegment] = span.segments;

                expect(firstSegment.trackId).toBe(entryTrack.id);
                expect(firstSegment.start).toBe(8);
                expect(firstSegment.end).toBe(10);

                expect(secondSegment.trackId).toBe(straightTrack.id);
                expect(secondSegment.start).toBe(10);
                expect(secondSegment.end).toBe(8);
            });
        });

        describe("Advancing backwards", () => {
            test("TrackPosition ends up in the right place", function () {
                const [
                    allEntities,
                    entryTrack,
                    straightTrack,
                ] = createReverseSwitchWorld();
                const position: TrackPosition = { offset: 9, track: straightTrack };

                const [span] = advanceAlongTrack(allEntities, position, 2);

                expect(span.endPosition.offset).toBe(9);
                expect(span.endPosition.track).toBe(entryTrack);
            });
            test("Correct segments are created", function () {
                const [
                    allEntities,
                    entryTrack,
                    straightTrack,
                ] = createReverseSwitchWorld();
                const position: TrackPosition = { offset: 9, track: straightTrack };

                const [span] = advanceAlongTrack(allEntities, position, 2);

                expect(span.segments).toHaveLength(2);

                const [firstSegment, secondSegment] = span.segments;

                expect(firstSegment.trackId).toBe(straightTrack.id);
                expect(firstSegment.start).toBe(9);
                expect(firstSegment.end).toBe(10);

                expect(secondSegment.trackId).toBe(entryTrack.id);
                expect(secondSegment.start).toBe(10);
                expect(secondSegment.end).toBe(9);
            });
        });
    });
});
