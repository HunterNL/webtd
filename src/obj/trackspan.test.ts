import { first } from "lodash";
import { WorldBuilder } from "../util/worldBuilder";
import { advanceAlongTrack, TrackPosition } from "./situation";
import { TrackSpan } from "./trackSpan";

function buildWorld() {
    const wb = new WorldBuilder();
    const startBuffer = wb.addBuffer();
    const endBuffer = wb.addBuffer();

    const firstSwitch = wb.addSwitch();
    const secondSwitch = wb.addSwitch();

    const entryTrack = wb.addTrack(startBuffer, firstSwitch, 10);
    const centerTrack = wb.addTrack(firstSwitch, secondSwitch, 10);
    const exitTrack = wb.addTrack(secondSwitch, endBuffer, 10);

    //Useless side track between switches
    const bogusTrack = wb.addTrack(firstSwitch, secondSwitch, 1000);

    wb.setJunction(firstSwitch.id, {
        straightConnections: [[entryTrack.id,centerTrack.id]],
        sideConnections: [[entryTrack.id,bogusTrack.id]]
    })

    wb.setJunction(secondSwitch.id, {
        straightConnections: [[centerTrack.id,exitTrack.id]],
        sideConnections: [[bogusTrack.id,exitTrack.id]]
    })

    return {entryTrack,centerTrack,exitTrack,entities: wb.getEntities()};
}

describe("Trackspan", () => {

    test.skip("It can simply travel back a single piece of track", () => {
        const {entryTrack,centerTrack,exitTrack, entities} = buildWorld();

        const position : TrackPosition = {
            track: entryTrack,
            offset:8
        };

        const span: TrackSpan = advanceAlongTrack(entities, position, -5);

        expect(span.segments).toHaveLength(1);

        const segment = span.segments[0]

        expect(segment.trackId).toBe(entryTrack.id);
        expect(segment.start).toBe(3);
        expect(segment.end).toBe(8);
    })
})