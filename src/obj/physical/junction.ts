import { Identifier, isIdentifier } from "../../interfaces/id";

export type Junction = {
    straightConnections: Array<[Identifier,Identifier]>,
    sideConnections: Array<[Identifier,Identifier]>
}

function isTrackPair(a: Array<any>): a is [number,number] {
    return isIdentifier(a[0]) && isIdentifier(a[1]);
}

export function isJunction(a : any) : a is Junction {
    const connectionsSets = [a.straightConnections,a.sideConnections];
    return connectionsSets.every(set => set.every(isTrackPair));
}