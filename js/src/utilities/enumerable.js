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

    arr.extractBy = extractBy;
    arr.searchBy  = searchBy;

    return arr;
};
