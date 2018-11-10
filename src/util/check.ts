export function createChecker<T>(func: (any: T) => boolean, errorMessage: string) {
    return (a:T) => {
        const succes = func(a);
        if(succes) return succes;
        throw new Error(errorMessage);
    }
}
