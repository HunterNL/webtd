import { times } from "lodash";
import { Entity } from "../interfaces/entity";
import { getId, Identifier } from "../interfaces/id";
import { finalizeEntities } from "../obj/environment";
import { Buffer } from "../obj/physical/buffer";
import { DriverMode } from "../obj/physical/driver";
import { Junction } from "../obj/physical/junction";
import { createTrainSpan, Ride } from "../obj/physical/ride";
import { Aspect, ASPECT_STOP, signalCreate } from "../obj/physical/signal";
import { Direction, DIRECTION_FORWARD, TrackPosition } from "../obj/physical/situation";
import { isSwitch, SwitchState, TrackBoundary, TrackSwitch } from "../obj/physical/switch";
import { createTrack, isTrack, Track, trackWeldArgument } from "../obj/physical/track";
import { Train } from "../obj/physical/train";

type RideArguments = {
    train: Train;
    position: TrackPosition;
    direction?: Direction;
    speed?: number;
    targetSpeed?: number;
    driverMode?: DriverMode
};

/***    
 * Utility class to manually build maps more conviniently with extra error checks
 */
export class WorldBuilder {
    counter: number;
    entities: Entity[];

    constructor() {
        this.counter = 0;
        this.entities = [];
    }

    addBuffer(n:number): Buffer[] {
        const ret: Buffer[] = [];
        times(n, () => {
            const buffer: Buffer = {
                id: this.counter++,
                type: "end",
            }
    
            this.entities.push(buffer);
            ret.push(buffer);
        })
        

        return ret
    }

    requireIdPresent(id: number): void {
        if(!this.entities.map(ent => ent.id).includes(id)) {
            throw new Error("Cannot reference nonexistent id " + id);
        }
    }

    addTrack(startBoundary: TrackBoundary, endBoundary: TrackBoundary, length: number, features?: trackWeldArgument): Track {
        this.requireIdPresent(startBoundary.id);
        this.requireIdPresent(endBoundary.id);

        const track = createTrack(this.counter++, startBoundary, endBoundary, length, features);

        this.entities.push(track);

        return track;
    }

    addSwitch(): TrackSwitch {
        const trackSwitch: TrackSwitch = {
            currentState: SwitchState.Straight,
            id: this.counter++,
            junction: null as any,
            type: "switch",
        }

        this.entities.push(trackSwitch);

        return trackSwitch
    }

    addTrain(length: number): Train {
        const train : Train = {
            id: this.counter++,
            length,
            type: "train",
        }

        this.entities.push(train);

        return train;
    }

    addRide({ train, position, direction = DIRECTION_FORWARD, speed = 0, driverMode }: RideArguments): Ride {
        const ride : Ride = {
            id: this.counter++,
            span: createTrainSpan(this.entities, position, train.length, direction),
            speed,
            train,
            type: "ride",
            driverMode,
            reversing: false
        }

        this.entities.push(ride);

        return ride;
    }

    addSignal(track: Track, offset?: number, direction: Direction = DIRECTION_FORWARD, aspect: Aspect = ASPECT_STOP) {
        const id = this.counter++

        const signal = signalCreate(id, track, direction, typeof offset === "undefined",offset)

        this.entities.push(signal);

        return signal;
    }

    setJunction(switchId: number, junction: Junction): void {
        this.requireValidSwitchReferences(junction);

        const trackSwitch = this.entities.find(ent => getId(ent) === switchId);

        if(!trackSwitch) {
            throw new Error("No switch with id " + switchId);
        }

        if(!isSwitch(trackSwitch)) {
            throw new Error(`Entity with id ${switchId} is not a switch`);
        }

        trackSwitch.junction = junction;
    }

    setSimpleJunction(swiId: Identifier, entryTrackId: Identifier, normalTrackId: Identifier, branchTrackId: Identifier) {
        const junction : Junction = {
            straightConnections:[[entryTrackId,normalTrackId]],
            sideConnections: [[entryTrackId,branchTrackId]]
        }

        this.setJunction(swiId, junction)
    }

    getEntities(): Entity[] {
        finalizeEntities(this.entities)
        return this.entities;
    }

    requireValidSwitchReferences(junction: Junction) : void {
        const tracksIds = this.entities.filter(isTrack).map(getId);

        const requireValidTrack = (trackId: number) => {
            if(!tracksIds.includes(trackId)) {
                throw new Error("Switch junction references unknown id " + trackId)
            }
        };

        junction.straightConnections.forEach(connection => connection.forEach(requireValidTrack));
        junction.sideConnections.forEach(connection => connection.forEach(requireValidTrack));
    }
    
}
