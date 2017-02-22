var mml = mml || {};
mml.utilities = mml.utilities || {};

mml.utilities.enumerable = function(arr) {
    'use strict';
    var searchBy = function(key, value) {
        var found = false;

        var search = function(hashmap) {
            if (hashmap[key] === value) {
                found = hashmap;
                return true;
            }
        };

        arr.some(search);

        return found;
    };
    var searchRegexBy = function(key, value) {
        var found = false;

        var search = function(hashmap) {
            var regex = new RegExp(hashmap[key]);
            if (regex.exec(value)) {
                found = hashmap;
                return true;
            }
        };

        arr.some(search);

        return found;
    };
    var extractBy = function(key, value) {
        var found = false;

        var search = function(hashmap, index) {
            if (hashmap[key] === value) {
                found = hashmap;
                arr.splice(index, 1);
                return true;
            }
        };

        arr.some(search);

        return found;
    };

    var sortBy = function(key) {
        arr = arr.sort(function(a, b) {
            return a[key] < b[key] ? -1 : (a[key] > b[key] ? 1 : 0);
        });
        return arr;
    }

    arr.extractBy = extractBy;
    arr.searchBy  = searchBy;
    arr.sortBy  = sortBy;
    arr.searchRegexBy  = searchRegexBy;

    return arr;
};
