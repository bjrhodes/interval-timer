export const enumerable = (arr) => {
    const searchBy = (key, value) => {
        let found = false;

        const search = (hashmap) => {
            if (hashmap[key] === value) {
                found = hashmap;
                return true;
            }
        };

        arr.some(search);

        return found;
    };
    const searchRegexBy = (key, value) => {
        let found = false;

        const search = (hashmap) => {
            const regex = new RegExp(hashmap[key]);
            if (regex.exec(value)) {
                found = hashmap;
                return true;
            }
        };

        arr.some(search);

        return found;
    };
    const extractBy = (key, value) => {
        let found = false;

        const search = (hashmap, index) => {
            if (hashmap[key] === value) {
                found = hashmap;
                arr.splice(index, 1);
                return true;
            }
        };

        arr.some(search);

        return found;
    };

    const sortBy = (key) => {
        arr = arr.sort((a, b) => {
            return a[key] < b[key] ? -1 : (a[key] > b[key] ? 1 : 0);
        });
        return arr;
    };

    arr.extractBy = extractBy;
    arr.searchBy  = searchBy;
    arr.sortBy  = sortBy;
    arr.searchRegexBy  = searchRegexBy;

    return arr;
};
