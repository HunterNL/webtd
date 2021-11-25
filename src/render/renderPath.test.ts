import { Track, TrackFeature, trackGetRenderPath } from "../obj/physical/track";
import { WorldBuilder } from "../util/worldBuilder";

function createWorld() {
    const wb = new WorldBuilder();
    const [sb,eb] = wb.addBuffer(2);
    const track = wb.addTrack(sb, eb, 512);

    sb.renderData = {
        position: [0,0]
    };

    eb.renderData = {
        position: [100,100]
    };

    (track as any).renderData = {rawFeatures:[]};

    return track;
}


describe("renderPath",() => {
    describe("fromTrack", () => {
        test("Create simple path", () => {
            const track = createWorld();
            expect(trackGetRenderPath(track)).toEqual([[0,0],[100,100]]);
        })

        test("Create path with waypoints", () => {
            const track = createWorld();
            track.features.push({
                type: "renderPoint",
                renderPosition: [0,100],
                position: "NONE",
            })
            expect(trackGetRenderPath(track)).toEqual([[0,0],[0,100],[100,100]]);
        })
    })
})

