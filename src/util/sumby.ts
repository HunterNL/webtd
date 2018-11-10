import { sum } from "ramda";

export function sumBy<T>(accessorFunction: (obj: T) => number, array: T[]) {
    return sum(array.map(accessorFunction))

}
