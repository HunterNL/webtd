// Adapted from https://stackoverflow.com/a/11301464

export function maxIndex(array: number[]) {
    if(array.length === 0) {
        throw new Error("Cannot get max of empty array")
    }

    let max = array[0];
    let maxIndex = 0;

    for (let i = 1; i < array.length; i++) {
        if (array[i] > max) {
            maxIndex = i;
            max = array[i];
        }
    }

    return maxIndex
}

  