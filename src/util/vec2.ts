import { vec2 } from "gl-matrix";

export function getDirection(origin: vec2, target: vec2): vec2 {
    return vec2.normalize(vec2.create(),
        vec2.sub(vec2.create(), target, origin)
    );
}
