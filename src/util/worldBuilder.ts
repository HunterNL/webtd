import { Entity } from "../interfaces/entity";
import { getId } from "../interfaces/id";
import { Buffer } from "../obj/buffer";
import { DriverMode } from "../obj/driver";
import { Junction } from "../obj/junction";
import { createTrainSpan, Ride } from "../obj/ride";
import { Signal } from "../obj/signal";
import { Direction, DIRECTION_FORWARD, TrackPosition } from "../obj/situation";
import { isSwitch, SwitchState, TrackBoundary, TrackSwitch } from "../obj/switch";
import { createTrack, isTrack, Track } from "../obj/track";
import { Train } from "../obj/train";

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

    addBuffer(): Buffer {
        const buffer: Buffer = {
            id: this.counter++,
            type: "end",
        }

        this.entities.push(buffer);

        return buffer
    }

    requireIdPresent(id: number): void {
        if(!this.entities.map(ent => ent.id).includes(id)) {
            throw new Error("Cannot reference nonexistent id " + id);
        }
    }

    addTrack(startBoundary: TrackBoundary, endBoundary: TrackBoundary, length: number): Track {
        this.requireIdPresent(startBoundary.id);
        this.requireIdPresent(endBoundary.id);

        const track = createTrack(this.counter++, startBoundary, endBoundary, length);

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
            position,
            span: createTrainSpan(this.entities, position, train.length, direction),
            speed,
            train,
            type: "ride",
            direction: direction,
            driverMode
        }

        this.entities.push(ride);

        return ride;
    }

    addSignal(track: Track, offset: number) {
        const signal : Signal = {
            id: this.counter++,
            position: {
                offset,
                track
            },
            type: "signal",
        }

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

    getEntities(): Entity[] {
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
