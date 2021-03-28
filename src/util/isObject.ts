export function isObject(any: unknown): any is Record<string,unknown> {
    return typeof any === "object";
}