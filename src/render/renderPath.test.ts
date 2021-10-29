import { Track, TrackFeature, trackGetRenderPath } from "../obj/track";
import { WorldBuilder } from "../util/worldBuilder";

function createWorld() {
    const wb = new WorldBuilder();
    const [sb,eb] = [wb.addBuffer(),wb.addBuffer()];
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

function addFeature(track:Track, feature: TrackFeature) {
    track.renderData?.rawFeatures.push(feature)
}

describe("renderPath",() => {
    describe("fromTrack", () => {
        test("Create simple path", () => {
            const track = createWorld();
            expect(trackGetRenderPath(track)).toEqual([[0,0],[100,100]]);
        })

        test("Create path with waypoints", () => {
            const track = createWorld();
            addFeature(track,{
                type: "renderPoint",
                position: [0,100]
            })
            expect(trackGetRenderPath(track)).toEqual([[0,0],[0,100],[100,100]]);
        })
    })
})

