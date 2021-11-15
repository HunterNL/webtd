import { flatten } from "lodash";
import { Entity } from "../../interfaces/entity";
import { switchSetState } from "../physical/switch";
import { isTrack } from "../physical/track";
import { doSegmentsOverlap, TrackSegment } from "../physical/trackSegment";
import { Path } from "./path";

export class Interlocking {
    private activePaths: Path[];
    public segmentMap: Map<TrackSegment, Path>;
    constructor(public entities: Entity[]) {
        this.activePaths = [];
        this.segmentMap = new Map();
    }

    setPath(path: Path) {
        const switches = path.switchStates;

        switches.forEach(swi => {
            switchSetState(swi.switch,swi.state);
        })

        const tracks = this.entities.filter(isTrack);

        

        path._span.segments.forEach((pathSegment) => {
            flatten(tracks.map(track => track.segments.detection)).forEach(detectionSegment => {
                if (doSegmentsOverlap(detectionSegment, pathSegment)) {
                    this.segmentMap.set(detectionSegment,path)
                }
            });
        })

        this.activePaths.push(path)

        console.log(this.segmentMap)
    }

    
}