import { Track } from "./track";
import { doSegmentsOverlap, segmentContainsPosition, splitTrackAtPoints, TrackSegment } from "./trackSegment";

describe("Tracksegment", () => {

    describe('Trackposition containment',() => {
        test("It returns false when given different trackIds", () => {
            expect(segmentContainsPosition({start:0,end:0,trackId:0},{track: {id:1}} as any)).toBe(false)
        })

        test("It returns false when outside the segment", () => {
            expect(segmentContainsPosition({start:0,end:10,trackId:0},{track: {id:0},offset: 20} as any)).toBe(false)
        })
        test("It returns true when inside the segment", () => {
            expect(segmentContainsPosition({start:0,end:10,trackId:0},{track: {id:0},offset: 5} as any)).toBe(true)
        })
    })


    describe("Segment overlap", () => {
        test("It returns flase when when given different trackIds", () => {

            expect(doSegmentsOverlap({start:0,end:0,trackId: 0}, {start:0,end:0,trackId:1})).toBeFalsy()

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


    it("Splits track into tracksegments", () => {
        const track : Track = {
            length: 10,
            id: 1
        } as any;

        const segments: TrackSegment[] = splitTrackAtPoints(track.id,track.length,[1,5]);

        expect(segments).toHaveLength(3);

        expect(segments[0]).toEqual({
            trackId: 1,
            start: 0,
            end: 1
        })

        expect(segments[1]).toEqual({
            trackId: 1,
            start: 1,
            end: 5
        })

        expect(segments[2]).toEqual({
            trackId: 1,
            start: 5,
            end: 10
        })
    })

    it("Returns a segment covering the whole track on empty input", () => {
        const track : Track = {
            length: 10,
            id: 1
        } as any;

        const segment: TrackSegment[] = splitTrackAtPoints(track.id, track.length, []);

        expect(segment).toHaveLength(1);

        expect(segment[0]).toEqual({
            trackId: 1,
            start: 0,
            end: 10
        });
    });
})
