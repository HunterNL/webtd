import { vec2 } from "gl-matrix";
import { joinWith } from "./joinWith";
import { maxIndex } from "./maxIndex";

export function getDirection(origin: vec2, target: vec2): vec2 {
    return vec2.normalize(vec2.create(),
        vec2.sub(vec2.create(), target, origin)
    );
}

export function vec2ToTuple(v: vec2): [number,number] {
    return [v[0],v[1]]
}

export function getLongestSpan(path: vec2[]): [vec2,vec2] {
    if(path.length === 2) {
        return path as [vec2,vec2];
    }

    if(path.length < 2) {
        throw new Error("Path too short")
    }

    const distances = joinWith(path, vec2.dist);

    const longestDistanceIdex = maxIndex(distances);

    return [path[longestDistanceIdex],path[longestDistanceIdex+1]];
}