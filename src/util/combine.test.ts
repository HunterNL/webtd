import { joinWith } from "./joinWith"

describe('joinWith',() => {
    test("It combines elements in in array",() => {
        expect(joinWith([3,2], (a,b) => a * b)).toEqual([6]);
        expect(joinWith([1,2,3], (a,b) => a + b)).toEqual([3,5]);
    });

    test("It throws on 1 element arrays", () => {
        expect(() => joinWith([1],() => 1)).toThrow();
    })
    
})