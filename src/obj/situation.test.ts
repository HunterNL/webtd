import { Buffer } from "./buffer"
import { advanceAlongTrack, DIRECTION_BACKWARD, DIRECTION_FORWARD, TrackPosition } from "./situation"
import { TrackSwitch, TrackBoundry, SwitchState } from "./switch"
import { Track } from "./track"
import { TrackSegment } from "./trackSegment";

// Simple 1 track

let id = 0;

function getNewId() {
    return id++;
}

function createTestTrack(boundries: TrackBoundry[], length: number) : Track {
    return {boundries, length, id : getNewId(),type:"track" } as Track;
}

function createTestBuffer() {
    return {id: getNewId(), type: "end"} as Buffer;
}


describe("Single track piece", function() {
    /*
    ┌─────────────────────────────────────────────┐
    │                                             │
    │  B──────────────────────────────────────B   │
    │  0                                     10   │
    │                                             │
    └─────────────────────────────────────────────┘
    */

    const [startBuffer, endBuffer] = [createTestBuffer(),createTestBuffer()]
    const simpleTrack = createTestTrack([startBuffer,endBuffer], 10);

    test("TrackPostion can advance forward",function() {
        const position : TrackPosition = {offset:0,track:simpleTrack}
    
        const span = advanceAlongTrack([simpleTrack], position, 1);

    
        expect(span.endPosition.offset).toBe(1);
    })

    test("Segment contains only 1 entry, with expected span", () => {
        const position : TrackPosition = {offset:0,track:simpleTrack}
    
        const span = advanceAlongTrack([simpleTrack], position, 1);

    
        expect(span.segments).toHaveLength(1);
        const segment : TrackSegment = span.segments[0];

        expect(segment).toEqual({
            trackId: simpleTrack.id,
            start: 0,
            end: 1
        })


    })
    
    test("TrackPostion can advance backward",function() {
        const position : TrackPosition = {offset:5,track:simpleTrack}
    
        const span = advanceAlongTrack([simpleTrack], position, -1)
    
        expect(span.endPosition.offset).toBe(4);
        expect(span.finalDirection).toBe(DIRECTION_BACKWARD)
    })
    
    
    test("TrackPostion can advance into a buffer and crash",function() {
        const position : TrackPosition = {offset:1,track:simpleTrack}
    
        expect(() => {
            advanceAlongTrack([simpleTrack], position, 10)
        }).toThrowError("Buffer overrun, derailed!")
    })
})

describe("Simple switch layout", function () {
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


    const trackSwitch : TrackSwitch = {
        currentState : SwitchState.Straight,
        id: getNewId(),
        type: "switch"
    } as any;

    const [entryBuffer,straightBuffer,sideBufffer] = [createTestBuffer(),createTestBuffer(),createTestBuffer()];
    // const [entryTrack,straightTrack,sideTrack] = [createTestTrack([], 10),createTestTrack([], 10),createTestTrack([], 10)]

    const entryTrack = createTestTrack([entryBuffer,trackSwitch], 10)
    const straightTrack = createTestTrack([trackSwitch,straightBuffer], 10)
    const sideTrack = createTestTrack([trackSwitch,sideBufffer], 10)

    trackSwitch.junction = {
        straightConnections: [[entryTrack.id,straightTrack.id]],
        sideConnections: [[entryTrack.id,sideTrack.id]]
    }

    const allEntities = [entryTrack,straightTrack,sideTrack,entryBuffer,straightBuffer,sideBufffer,trackSwitch];
    
    test("TrackPosition can advance along switches", function() {
        const position : TrackPosition = {offset:8,track:entryTrack}
    
        const span = advanceAlongTrack(allEntities,position,4);
    
        expect(span.endPosition.offset).toBe(2);
        expect(span.endPosition.track).toBe(straightTrack);

        expect(span.segments).toHaveLength(2);
        const [firstSegment,secondSegment] = span.segments;

        expect(firstSegment).toEqual({
            trackId:entryTrack.id,
            start: 8,
            end: 10
        })

        expect(secondSegment).toEqual({
            trackId: straightTrack.id,
            start: 0,
            end: 2
        })

        expect(span.finalDirection).toBe(DIRECTION_FORWARD)
    })
    
    test("TrackPosition can reverse along switches", function() {
        const position : TrackPosition = {offset:3,track:straightTrack}
    
        const span = advanceAlongTrack(allEntities,position,-5);
    
        expect(span.endPosition.offset).toBe(8);
        expect(span.endPosition.track).toBe(entryTrack);
        expect(span.segments).toHaveLength(2);

        const [firstSegment,secondSegment] = span.segments;

        expect(firstSegment.trackId).toBe(straightTrack.id);
        expect(firstSegment.start).toBe(0);
        expect(firstSegment.end).toBe(3);

        expect(secondSegment.trackId).toBe(entryTrack.id);
        expect(secondSegment.end).toBe(10) // Track length
        expect(secondSegment.start).toBe(8);

        expect(span.finalDirection).toBe(DIRECTION_BACKWARD);
    })
    
    
})


describe("Reverse exit track", function() {
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
    │                                             │
    └─────────────────────────────────────────────┘
    */

    const trackSwitch : TrackSwitch = {
        currentState : SwitchState.Straight,
        id: getNewId(),
        type: "switch"
    } as any;

    const [entryBuffer,straightBuffer,sideBufffer] = [createTestBuffer(),createTestBuffer(),createTestBuffer()];
    // const [entryTrack,straightTrack,sideTrack] = [createTestTrack([], 10),createTestTrack([], 10),createTestTrack([], 10)]

    const entryTrack = createTestTrack([entryBuffer,trackSwitch], 10)
    const straightTrack = createTestTrack([straightBuffer,trackSwitch], 10) // Gets reversed here
    const sideTrack = createTestTrack([trackSwitch,sideBufffer], 10)

    trackSwitch.junction = {
        straightConnections: [[entryTrack.id,straightTrack.id]],
        sideConnections: [[entryTrack.id,sideTrack.id]]
    }

    const allEntities = [entryTrack,straightTrack,sideTrack,entryBuffer,straightBuffer,sideBufffer,trackSwitch];

    test("TrackPosition can advance along switches", function() {
        const position : TrackPosition = {offset:8,track:entryTrack}
    
        const span = advanceAlongTrack(allEntities,position,4);
    
        expect(span.endPosition.offset).toBe(8);
        expect(span.endPosition.track).toBe(straightTrack);

        expect(span.segments).toHaveLength(2);

        const [firstSegment,secondSegment] = span.segments;

        expect(firstSegment.trackId).toBe(entryTrack.id);
        expect(firstSegment.start).toBe(8);
        expect(firstSegment.end).toBe(10);

        expect(secondSegment.trackId).toBe(straightTrack.id);
        expect(secondSegment.start).toBe(8);
        expect(secondSegment.end).toBe(10);

        expect(span.finalDirection).toBe(DIRECTION_BACKWARD)
    })

    test("TrackPosition can reverse along switches", function() {
        const position : TrackPosition = {offset:9,track:straightTrack}
    
        const span = advanceAlongTrack(allEntities,position,2);
    
        expect(span.endPosition.offset).toBe(9);
        expect(span.endPosition.track).toBe(entryTrack);

        expect(span.segments).toHaveLength(2);

        const [firstSegment,secondSegment] = span.segments;

        expect(firstSegment.trackId).toBe(straightTrack.id);
        expect(firstSegment.start).toBe(9);
        expect(firstSegment.end).toBe(10);

        expect(secondSegment.trackId).toBe(entryTrack.id);
        expect(secondSegment.start).toBe(9);
        expect(secondSegment.end).toBe(10);

        expect(span.finalDirection).toBe(DIRECTION_BACKWARD);
    })
    
})