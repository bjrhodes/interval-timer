var mml = mml || {};
mml.utilities = mml.utilities || {};

mml.utilities.Classy = function(document) {
    'use strict';
    var self,
        classList = {
            add : function(el, myClass) {
                if (self.has(el, myClass)) {
                    return;
                }
              el.classList.add(myClass);
            },
            remove : function(el, myClass) {
                while (self.has(el, myClass)) {
                    el.classList.remove(myClass);
                }
            },
            has : function(el, myClass) {
                return el.classList.contains(myClass);
            }
        },
        className = {
            add : function(el, myClass) {
                if (self.has(el, myClass)) {
                    return;
                }
              el.className += ' ' + myClass;
            },
            remove : function(el, myClass) {
                while (self.has(el, myClass)) {
                    el.className = el.className.replace(myClass, '');
                }
            },
            has : function(el, myClass) {
                return (el.className.indexOf(myClass) !== -1);
            }
        };

    if (typeof(document.body.classList) !== 'undefined') {
        self = classList;
    } else {
        self = className;
    }

    return self;
};
