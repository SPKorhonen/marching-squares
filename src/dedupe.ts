export default function dedupe(array: number[][]) {
    const found = {};
    let newArray = [];
    let key;
    let pt;

    for (let i = array.length - 1; i >= 0; i -= 1) {
        pt = array[i];
        key = `${pt[0]},${pt[1]}`;
        if (!found[key]) {
            found[key] = true;
            newArray.unshift(pt);
        }
    }

    return newArray;
}