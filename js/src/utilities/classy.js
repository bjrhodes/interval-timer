export const Classy = (document) => {
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
        // work on whole class names, so "btn" doesn't match "btn-primary".
        classNames = (el) => el.className.split(/\s+/).filter((name) => name),
        className = {
            add : (el, myClass) => {
                if (self.has(el, myClass)) {
                    return;
                }
                el.className = classNames(el).concat(myClass).join(' ');
            },
            remove : (el, myClass) => {
                el.className = classNames(el).filter((name) => name !== myClass).join(' ');
            },
            has : (el, myClass) => {
                return classNames(el).includes(myClass);
            }
        };

    const self = (typeof(document.body.classList) !== 'undefined') ? classList : className;

    return self;
};
