export function createChecker<T>(func: (any: T) => boolean, errorMessage: string): (a:T) => true | never {
    const func2 = (a:T) => {
        const res = !!func(a);
        if(res) {
            return (true as const);
        }
        throw new Error(errorMessage);
    }

    return func2;
}
