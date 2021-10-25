// https://stackoverflow.com/a/5650012
export function remap(value: number, inLow: number, inHigh: number, outLow: number, outHigh: number): number {
    return outLow + (outHigh - outLow) * (value - inLow) / (inHigh - inLow);
}

export function invLerp(value: number, low: number, high: number): number {
    return (value - low) / (high - value)

}