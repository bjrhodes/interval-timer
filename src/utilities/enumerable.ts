export type Enumerable<T> = T[] & {
    searchBy: <K extends keyof T>(key: K, value: T[K]) => T | false;
    searchRegexBy: (key: keyof T, value: string) => T | false;
    extractBy: <K extends keyof T>(key: K, value: T[K]) => T | false;
    sortBy: (key: keyof T) => Enumerable<T>;
};

export const enumerable = <T>(arr: T[]): Enumerable<T> => {
    const searchBy = <K extends keyof T>(key: K, value: T[K]) => {
        return arr.find((hashmap) => hashmap[key] === value) || false;
    };
    const searchRegexBy = (key: keyof T, value: string) => {
        return arr.find((hashmap) => new RegExp(hashmap[key] as string | RegExp).exec(value)) || false;
    };
    const extractBy = <K extends keyof T>(key: K, value: T[K]) => {
        const index = arr.findIndex((hashmap) => hashmap[key] === value);
        return index === -1 ? false : arr.splice(index, 1)[0];
    };

    // Returns a sorted copy, leaving the original order intact.
    const sortBy = (key: keyof T) => {
        return enumerable([...arr].sort((a, b) => {
            return a[key] < b[key] ? -1 : (a[key] > b[key] ? 1 : 0);
        }));
    };

    return Object.assign(arr, { extractBy, searchBy, sortBy, searchRegexBy });
};
