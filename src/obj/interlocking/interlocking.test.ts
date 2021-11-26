import _, { last } from "lodash";
import { Entity } from "../../interfaces/entity";
import { WorldBuilder } from "../../util/worldBuilder";
import { Buffer } from "../physical/buffer";
import { searchPathToTrack, Signal } from "../physical/signal";
import { DIRECTION_FORWARD } from "../physical/situation";
import { SwitchState, TrackSwitch } from "../physical/switch";
import { isWeld, Track, TrackWeld } from "../physical/track";
import { findRoutes } from "./findRoutes";
import { Interlocking } from "./interlocking";
import { Path } from "./path";

function createSingleTrack(): [Entity[],Track, Buffer] {
    const wb = new WorldBuilder();
    const [b1,b2] = wb.addBuffer(2);
    const track = wb.addTrack(b1, b2, 100);

    return [wb.getEntities(),track,b2]
}

function createSwitchWorld(): [Entity[], Track, Track, Track, TrackSwitch, Signal] {
    const wb  = new WorldBuilder();

    const [start, branch, main] = wb.addBuffer(3);
    const swi = wb.addSwitch();

    const startTrack = wb.addTrack(start, swi, 100);
    const mainTrack = wb.addTrack(swi, main, 100);
    const branchTrack = wb.addTrack(swi, branch, 100);

    wb.setSimpleJunction(swi.id, startTrack.id, mainTrack.id, branchTrack.id);

    const lastWeld = _.chain(startTrack.features).filter(isWeld).last().value();

    lastWeld.signalIds.push(9)

    const train = wb.addTrain(50);

    wb.addRide({
        position: {
            track: startTrack,
            offset: 80
        },
        train,
    })

    const signal = wb.addSignal(startTrack)

    return [wb.getEntities(), startTrack,mainTrack,branchTrack, swi, signal]
}

describe("Routesetting", () => {

    describe('searchPath',() => {
        test('find path from signal to track',() => {
            const [entities, startTrack, mainTrack, branchTrack, trackSwitch, signal] = createSwitchWorld();
            const interlocking = new Interlocking(entities);

            expect(trackSwitch.currentState).toEqual(SwitchState.Straight);
            const path = searchPathToTrack(signal, branchTrack.id)

            expect(last(path?.segments)!.trackId).toEqual(branchTrack.id)
        })
    })

    describe("setRoute",() => {
        test('sets switch state',() => {
            const [entities, _, __, branchTrack, trackSwitch, signal] = createSwitchWorld();
            const interlocking = new Interlocking(entities);
            const path = (searchPathToTrack(signal, branchTrack.id) as Path)

            expect(trackSwitch.currentState).toEqual(SwitchState.Straight);
        
            interlocking.setPath(path);

            expect(trackSwitch.currentState).toEqual(SwitchState.Side);
        })
    })
})

describe('findRoutes',() => {
    describe("over switch", () => {
        test("Each path returns initial segment",() => {
            const [entities, startTrack, mainTrack, branchTrack, trackSwitch, signal] = createSwitchWorld();
            const weld = startTrack.features[0] as TrackWeld;
            const routes = findRoutes(entities,startTrack, weld,DIRECTION_FORWARD)

            expect(routes).toHaveLength(2) // main & branch

            expect(routes[0][0]).toBe(startTrack.segments.detection[1]);
            expect(routes[1][0]).toBe(startTrack.segments.detection[1]);
        })

        test("Returns end position position",() => {
            const [entities, startTrack, mainTrack, branchTrack, trackSwitch, signal] = createSwitchWorld();
            const weld = startTrack.features[0] as TrackWeld;
            const routes = findRoutes(entities,startTrack, weld, DIRECTION_FORWARD)

            expect(routes).toHaveLength(2) // main & branch

            expect(last(routes[0])).toBe(mainTrack.segments.detection[1]);
            expect(last(routes[1])).toBe(branchTrack.segments.detection[1]);
        })

        // test("Returns all segments",() => {
        //     const [entities, startTrack, mainTrack, branchTrack, trackSwitch, signal] = createSwitchWorld();
        //     const weld = startTrack.features[0] as TrackWeld;            
        //     const [trackSpan] = findRoutes(entities,startTrack, weld, DIRECTION_FORWARD)

        //     expect(trackSpan.segments).toEqual([{
        //         trackId: track.id,
        //         start: 70,
        //         end: 100,
        //         endBoundary: endBuffer
        //     }])
        // })
    })

    // describe.skip('on simple switch',() => {
    //     test("Returns end position positions",() => {
    //         const [entities,startTrack, mainTrack, branchTrack] = createSwitchWorld();
    //         const trackPos :TrackPosition = {
    //             offset: 70,
    //             track: startTrack
    //         }
    //         const spans = findRoutes(entities,trackPos,DIRECTION_FORWARD)

    //         expect(spans).toHaveLength(2);

    //         expect(spans).toContainEqual(expect.objectContaining({
    //             endPosition: {track: mainTrack, offset:100}
    //         }))

    //         expect(spans).toContainEqual(expect.objectContaining({
    //             endPosition: {track: branchTrack, offset:100}
    //         }))
    //     })

    //     test("returns track segments",() => {
    //         const [entities,startTrack, mainTrack, branchTrack] = createSwitchWorld();
    //         const trackPos :TrackPosition = {
    //             offset: 70,
    //             track: startTrack
    //         }
    //         const spans = findRoutes(entities,trackPos,DIRECTION_FORWARD)

    //         const expectedStartSegment : TrackSegment = expect.objectContaining({
    //             start: 70,
    //             end: 100,
    //             trackId: startTrack.id
    //         })
    //         const expectedMainSegment : TrackSegment = expect.objectContaining({
    //             start: 0,
    //             end: 100,
    //             trackId: mainTrack.id
    //         })
    //         const expectedBranchSegment : TrackSegment = expect.objectContaining({
    //             start: 0,
    //             end: 100,
    //             trackId: branchTrack.id
    //         })

    //         expect(spans).toHaveLength(2)

    //         const segments = spans.map(span => span.segments);

    //         expect(segments).toContainEqual([expectedStartSegment, expectedMainSegment])
    //         expect(segments).toContainEqual([expectedStartSegment, expectedBranchSegment])
    //     })
        
    // })
})