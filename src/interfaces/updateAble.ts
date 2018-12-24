import { isFunction } from "lodash";

export interface Updateable<T> {
    update: (obj: T, dt:number) => any;
}

export function isUpdateable<T>(any: any): any is Updateable<T> {
    return isFunction(any.update)
}