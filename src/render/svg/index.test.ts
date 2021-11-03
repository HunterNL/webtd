import { vec2 } from "gl-matrix";
import { vec2PathLerp } from "..";

describe("render Utils", () => {
    describe("vec2pathLerp", () => {
        test("Throws on short paths", ()  => {
            expect(() => vec2PathLerp([[1,1]],0)).toThrow();
        })
        test("Throws on invalid lerp values ", ()  => {
            expect(() => vec2PathLerp(0 as any, -1)).toThrow();
            expect(() => vec2PathLerp(0 as any, 1.2)).toThrow();
        })

        const path = [[0,0],[0,100],[100,100]] as vec2[];

        test("Returns first and last postions exactly", () => {
            expect(vec2PathLerp(path,0)).toStrictEqual(path[0]);
            expect(vec2PathLerp(path,1)).toStrictEqual(path[2]);
        })

        test("Returns perfect waypoint exactly", () => {
            expect(vec2PathLerp(path,0.5)).toStrictEqual(path[1]);
        })

        test("Lerps between points", () => {
            expect(Array.from(vec2PathLerp(path,0.05))).toEqual([0,10]);
            expect(Array.from(vec2PathLerp(path,0.25))).toEqual([0,50]);
            expect(Array.from(vec2PathLerp(path,0.9))).toEqual([80,100]);
        })
    })
})