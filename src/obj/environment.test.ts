import map from "../data/map.json";
import { loadEnvironment } from "./environment";

test("Env loader",function() {
    expect(loadEnvironment(map)).toMatchSnapshot();
})