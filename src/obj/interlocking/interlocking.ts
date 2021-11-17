import { flatten } from "lodash";
import { Entity } from "../../interfaces/entity";
import { Signal } from "../physical/signal";
import { switchSetState } from "../physical/switch";
import { isTrack } from "../physical/track";
import { doSegmentsOverlap, TrackSegment } from "../physical/trackSegment";
import { Path } from "./path";

export class Interlocking {
    
    private activePaths: Map<Path, boolean>;
    public segmentMap: Map<TrackSegment, Path>;
    constructor(public entities: Entity[]) {
        this.activePaths = new Map();
        this.segmentMap = new Map();
    }

    setPath(path: Path) {
        if(this.activePaths.get(path)) {
            console.warn("Path already set"); // TODO: Better feedback
            return;
        }

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

        path.signal.currentAspect = "ASPECT_PROCEED_SLOW";
        this.activePaths.set(path,true);
    }

    recallPath(path: Path) {
        if(!this.activePaths.get(path)) {
            console.warn("Path not active"); // TODO better feedback
        }

        

        const tracks = this.entities.filter(isTrack);

        path._span.segments.forEach((pathSegment) => {
            flatten(tracks.map(track => track.segments.detection)).forEach(detectionSegment => {
                if (doSegmentsOverlap(detectionSegment, pathSegment)) {
                    this.segmentMap.delete(detectionSegment)
                }
            });
        })

        path.signal.currentAspect = "ASPECT_STOP";
        this.activePaths.delete(path);
    }

    recallSignal(signal: Signal) {
        this.activePaths.forEach((_,path) => {
            if(path.signal == signal) {
                this.recallPath(path)
            }
        })
    }
}