import { vec2ToTuple } from "../util/vec2";
import { WorldBuilder } from "../util/worldBuilder";
import { generateSegments, Track, trackWeldArgument } from "../obj/physical/track";
import { trackCreateRenderBlocks } from "./trackCreateRenderBlocks";

function createBufferWorld(welds: trackWeldArgument): Track {
    const wb = new WorldBuilder();
    const [sb,eb] = wb.addBuffer(2)
    const track = wb.addTrack(sb, eb, 400, welds);

    sb.renderData = {position:[0,0]}
    eb.renderData = {position:[0,100]}    

    return track;
}

function createSwitchWorld(welds: trackWeldArgument): Track {
    const wb = new WorldBuilder();
    const [sb,eb] = [wb.addSwitch(),wb.addSwitch()];
    const track = wb.addTrack(sb, eb, 400, welds);

    sb.renderData = {position:[0,0]}
    eb.renderData = {position:[0,100]}

    return track;
}

describe('detectionBlock',() => {
    describe('fromTrack',() => {

        describe('switch data',() => {
            test("2 buffers",() => {
                const track = createBufferWorld([])
                const blocks = trackCreateRenderBlocks(track);
    
                expect(blocks[0]).toEqual(expect.objectContaining({
                    startsAtSwitch: false,
                    endsAtSwitch: false,
                }));
            })
            test("2 switches",() => {
                const track = createSwitchWorld([])
                const blocks = trackCreateRenderBlocks(track);
    
                expect(blocks[0]).toEqual(expect.objectContaining({
                    startsAtSwitch: true,
                    endsAtSwitch: true,
                }));
            })
            test("2 switches - 2 blocks",() => {
                const track = createSwitchWorld([200])
                const blocks = trackCreateRenderBlocks(track);
    
                expect(blocks[0]).toEqual(expect.objectContaining({
                    startsAtSwitch: true,
                    endsAtSwitch: false,
                }));
    
                expect(blocks[1]).toEqual(expect.objectContaining({
                    startsAtSwitch: false,
                    endsAtSwitch: true,
                }));
            })
        })

        describe('generates renderPath',() => {
            test("without renderpoints",() => {
                const track = createBufferWorld([])
                const blocks = trackCreateRenderBlocks(track);

                expect(blocks[0]).toEqual(expect.objectContaining({
                    renderPoints: [[0,0],[0,100]]
                }));
            })

            test("with renderPoints", () => {
                const track = createBufferWorld([])
                
                track.features.push({
                    type:"renderPoint",
                    renderPosition: [50,50]
                })

                const blocks = trackCreateRenderBlocks(track);

                expect(blocks[0]).toEqual(expect.objectContaining({
                    renderPoints: [[0,0],[50,50],[0,100]]
                }));
            })
        })

        describe('interpolates weld positions',() => {
            const track = createBufferWorld([300])
                
                track.features = [
                        {type:"renderPoint",renderPosition:[50,50]},
                        {type:"weld", position: 300,signalIds:[]}
                    ]
                

                const blocks = trackCreateRenderBlocks(track);

                expect(blocks[0].renderPoints.map(vec2ToTuple)).toEqual([[0,0],[50,50],[25,75]]);

                expect(blocks[1].renderPoints.map(vec2ToTuple)).toEqual([[25,75],[0,100]]);
        }) 
    })
})