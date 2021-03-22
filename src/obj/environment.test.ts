import map from "../data/map.json";
import { loadEnvironment, verifyConnections } from "./environment";

test.skip("Env loader",function() {
    const env = loadEnvironment(map);
    expect(() => verifyConnections(env)).not.toThrow();
})