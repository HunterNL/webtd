import { combine } from "./combine"

describe('Combine',() => {
    test("It combines elements in in array",() => {
        expect(combine([3,2], (a,b) => a * b)).toEqual([6]);
        expect(combine([1,2,3], (a,b) => a + b)).toEqual([3,5]);
    });

    test("It throws on 1 element arrays", () => {
        expect(() => combine([1],() => 1)).toThrow();
    })
    
})