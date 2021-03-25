import { doSegmentsOverlap } from "./trackSegment";

describe("Tracksegment", () => {
    test("It errors when given different trackIds", () => {
        expect(() => {
            doSegmentsOverlap({start:0,end:0,trackId: 0}, {start:0,end:0,trackId:1});
        }).toThrow("Trying to compare tracksegments across different tracks");
    })

    test("It detects overlaps",() => {
        expect(doSegmentsOverlap({start:0,end:2,trackId:0},{start:1,end:3,trackId:0})).toBe(true);
        expect(doSegmentsOverlap({start:1,end:3,trackId:0},{start:0,end:2,trackId:0})).toBe(true); // Other way around
    })

    it("Detects not overlapping", () => {
        expect(doSegmentsOverlap({start:0,end:2,trackId:0},{start:2,end:4,trackId:0})).toBe(false);
        expect(doSegmentsOverlap({start:2,end:4,trackId:0},{start:0,end:2,trackId:0})).toBe(false); // Other way around
    })
})