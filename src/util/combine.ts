export function combine<T,U>(list: Array<T>, func: (a:T,b: T) => U) : Array<U> {
    if(list.length < 2 ) {
        throw new Error("Combine needs an array of at least 2 items");
    }

    const returnValues = []

    for (let index = 0; index < list.length -1; index++) {
        const element = list[index];
        const nextElement = list[index+1];

        returnValues.push(func(element, nextElement));
    }

    return returnValues;
}