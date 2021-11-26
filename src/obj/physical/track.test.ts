import { WorldBuilder } from "../../util/worldBuilder";
import { Buffer } from "./buffer";
import { TrackBoundary, TrackSwitch } from "./switch";
import { createTrack, generateSegments, SWITCH_WELD_OFFSET, TrackWeld, weldGetAjoiningSegments } from "./track";

function generateSimpleWorld(): [TrackBoundary, TrackBoundary] {
    const wb = new WorldBuilder();

    return wb.addBuffer(2) as [Buffer,Buffer]
}

function generateSwitchWorld(): [Buffer, TrackSwitch] {
    const wb = new WorldBuilder();
    const [buffer] = wb.addBuffer(1);

    return [buffer,wb.addSwitch()]

}
function generateDualSwitchWorld(): [TrackSwitch, TrackSwitch] {
    const wb = new WorldBuilder();

    return [wb.addSwitch(),wb.addSwitch()]

}

describe("generateSegment",() => {
    test("Generates single segments on plain track",() => {
        const [sb,eb] = generateSimpleWorld();

        const segments = createTrack(-1, sb, eb, 140).segments.detection

        expect(segments).toHaveLength(1);
    })
    test("Generates segments with proper start and end",() => {
        const [sb,eb] = generateSimpleWorld();

        const segments = createTrack(-1, sb, eb, 140).segments.detection

        expect(segments[0].start).toBe(0);
        expect(segments[0].end).toBe(140);
    })
    test("Generates segments with proper boundaries",() => {
        const [sb,eb] = generateSimpleWorld();

        const segments = createTrack(-1, sb, eb, 140).segments.detection

        expect(segments[0].startBoundary).toBe(sb);
        expect(segments[0].endBoundary).toBe(eb);
    })

    test("Generates extra segment next to switches",() => {
        const [buffer,swi] = generateSwitchWorld();

        const segments = createTrack(-1, buffer,swi, 150).segments.detection

        expect(segments).toHaveLength(2);
    })

    test("Generates extra segment next to switches",() => {
        const [buffer,swi] = generateSwitchWorld();

        const segments = createTrack(-1, buffer,swi, 150).segments.detection

        const switchSegment = segments[1];
        
        expect(switchSegment.start).toBe(150-SWITCH_WELD_OFFSET);
        expect(switchSegment.end).toBe(150);
        expect(switchSegment.endBoundary).toBe(swi)
    })

    test("Creates weld in the middle between switches on short tracks",() => {
        const [ls,rs] = generateDualSwitchWorld();

        const segments = createTrack(-1, ls,rs, 80).segments.detection;

        const [leftSegment,rightSegment] = segments;

        expect(segments).toHaveLength(2);

        expect(leftSegment.start).toBe(0);
        expect(leftSegment.end).toBe(40);

        expect(rightSegment.start).toBe(40);
        expect(rightSegment.end).toBe(80);       
    })
    test("Finds adjecent segments",() => {
        const [ls,rs] = generateDualSwitchWorld();

        const track = createTrack(-1, ls,rs, 80);

        const [leftSegment,rightSegment] = track.segments.detection;
        const weld = track.features[0];

        const {front,back} = weldGetAjoiningSegments(track,weld as TrackWeld);

        expect(front).toBe(rightSegment);
        expect(back).toBe(leftSegment);
    })
})