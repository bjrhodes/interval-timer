export const enumerable = (arr) => {
    const searchBy = (key, value) => {
        return arr.find((hashmap) => hashmap[key] === value) || false;
    };
    const searchRegexBy = (key, value) => {
        return arr.find((hashmap) => new RegExp(hashmap[key]).exec(value)) || false;
    };
    const extractBy = (key, value) => {
        const index = arr.findIndex((hashmap) => hashmap[key] === value);
        return index === -1 ? false : arr.splice(index, 1)[0];
    };

    // Returns a sorted copy, leaving the original order intact.
    const sortBy = (key) => {
        return enumerable([...arr].sort((a, b) => {
            return a[key] < b[key] ? -1 : (a[key] > b[key] ? 1 : 0);
        }));
    };

    arr.extractBy = extractBy;
    arr.searchBy  = searchBy;
    arr.sortBy  = sortBy;
    arr.searchRegexBy  = searchRegexBy;

    return arr;
};
