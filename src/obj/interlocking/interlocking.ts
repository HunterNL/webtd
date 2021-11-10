import { Entity } from "../../interfaces/entity";
import { switchSetState } from "../physical/switch";
import { Path } from "./path";

export class Interlocking {
    private activePaths: Path[];
    constructor(public entities: Entity[]) {
        this.activePaths = [];
    }

    setPath(path: Path) {
        const switches = path.switchStates;

        switches.forEach(swi => {
            switchSetState(swi.switch,swi.state);
        })

        this.activePaths.push(path)
    }
}