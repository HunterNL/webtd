import { Buffer } from "./buffer"
import { advanceAlongTrack, TrackPosition } from "./situation"
import { TrackSwitch, TrackBoundry, SwitchState } from "./switch"
import { Track } from "./track"

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

const [startBuffer, endBuffer] = [createTestBuffer(),createTestBuffer()]
const simpleTrack = createTestTrack([startBuffer,endBuffer], 10);

const trackSwitch : TrackSwitch = {
    currentState : SwitchState.Straight,
    id: getNewId(),
    type: "switch"
} as any;

/*
┌─────────────────────────────────────────────┐
│                                             │
│                          SideTrack          │
│                       ┌─────────────────B   │
│                       │                     │
│                       │                     │
│    EntryTrack         │  StraightTrack      │
│  B────────────────────S─────────────────B   │
│                                             │
│                                             │
└─────────────────────────────────────────────┘
 */

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

test("TrackPostion can advance forward",function() {
    const position : TrackPosition = {offset:0,track:simpleTrack}

    advanceAlongTrack([simpleTrack], position, 1)

    expect(position.offset).toBe(1);
})

test("TrackPostion can advance backward",function() {
    const position : TrackPosition = {offset:1,track:simpleTrack}

    advanceAlongTrack([simpleTrack], position, -1)

    expect(position.offset).toBe(0);
})


test("TrackPostion can advance into a buffer and crash",function() {
    const position : TrackPosition = {offset:1,track:simpleTrack}

    expect(() => {
        advanceAlongTrack([simpleTrack], position, 10)
    }).toThrowError("Buffer overrun, derailed!")
})

test("TrackPosition can advance along switches", function() {
    const position : TrackPosition = {offset:8,track:entryTrack}

    advanceAlongTrack(allEntities,position,4);

    expect(position.offset).toBe(2);
    expect(position.track).toBe(straightTrack);
})