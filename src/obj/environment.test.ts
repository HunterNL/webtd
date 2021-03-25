import map from "../data/map.json";
import { loadEnvironment, verifyConnections } from "./environment";

test("Env loader",function() {
    const env = loadEnvironment(map);
    expect(() => verifyConnections(env)).not.toThrow();
})