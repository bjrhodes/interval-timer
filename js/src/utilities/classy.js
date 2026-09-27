window.mml = window.mml || {};
mml.utilities = mml.utilities || {};

mml.utilities.Classy = (document) => {
    'use strict';
    const classList = {
            add : (el, myClass) => {
                if (self.has(el, myClass)) {
                    return;
                }
              el.classList.add(myClass);
            },
            remove : (el, myClass) => {
                while (self.has(el, myClass)) {
                    el.classList.remove(myClass);
                }
            },
            has : (el, myClass) => {
                return el.classList.contains(myClass);
            }
        },
        className = {
            add : (el, myClass) => {
                if (self.has(el, myClass)) {
                    return;
                }
              el.className += ' ' + myClass;
            },
            remove : (el, myClass) => {
                while (self.has(el, myClass)) {
                    el.className = el.className.replace(myClass, '');
                }
            },
            has : (el, myClass) => {
                return (el.className.indexOf(myClass) !== -1);
            }
        };

    const self = (typeof(document.body.classList) !== 'undefined') ? classList : className;

    return self;
};
