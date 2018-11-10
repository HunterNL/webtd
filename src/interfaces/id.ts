export type Identifier = number;
export type Identifiable = {
    id: Identifier
}

export function isIdentifier(any: any) : any is Identifier {
    return (typeof any === "number");
}

export function isIdentifiable(any: any): any is Identifiable {
    return any && isIdentifier(any.id);
}