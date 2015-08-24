export default {

    el (name, attrs={}) {
        let el = document.createElement(name);
        Object.keys(attrs).forEach(k => el.setAttribute(k, attrs[k]));
        return el;
    },

    attr (el, attr, val) {
        if (val === undefined) {
            return el.getAttribute(attr);
        }
        if (typeof attr === 'object') {
            Object.keys(attr).forEach(k => el.setAttribute(k, attr[k]));
        } else {
            el.setAttribute(attr, val);
        }
        return el;
    },

    prop (el, prop, val) {
        if (typeof prop === 'object') {
            Object.keys(prop).forEach(k => el[k] = prop[k]);
            return el;
        }
        if (val === undefined) {
            return el[prop];
        }
        el[prop] = val;
        return el;
    },

    id (sel) {
        return document.getElementById(sel);
    },

    qs (sel, node) {
        return (node || document).querySelector(sel);
    },

    qsa (sel, node) {
        return (node || document).querySelectorAll(sel);
    },

    on (el, evt, cb) {
        el.addEventListener(evt, cb);
        return el;
    },

    off (el, evt, cb) {
        el.removeEventListener(evt, cb);
        return el;
    },

    once (el, evt, cb) {
        el.addEventListener(evt, function listener(...args) {
            cb(...args);
            el.removeEventListener(evt, listener);
        });
        return el;
    },

    pos (el) {
        return el.getBoundingClientRect();
    },

    style (el, style, value) {
        if (value === undefined) {
            return getComputedStyle(el);
        }
        el.style[style] = value;
        return el;
    }
};
