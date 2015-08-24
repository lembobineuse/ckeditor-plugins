import $ from './dom.js';


const cache = {};


export default class AssetLoader
{
    static CSS = 'css';
    static JS = 'js';

    constructor (path) {
        this._path = path;
    }

    loadCSS (path) {
        return this._load(AssetLoader.CSS, path);
    }

    loadJS (path) {
        return this._load(AssetLoader.JS, path);
    }

    _load (type, path) {
        const fullpath = `${this._path}/${path}`;
        if (cache[fullpath]) {
            return Promise.resolve(cache[fullpath]);
        }

        const asset = this._createElement(type, fullpath);

        return new Promise((resolve, reject) => {
            $.on(asset, 'load', () => {
                cache[fullpath] = asset;
                resolve(asset);
            });
            $.on(asset, 'error', () => {
                cache[fullpath] = null;
                reject(fullpath);
            });
            document.head.appendChild(asset);
        });
    }

    _createElement (type, href) {
        let el;
        switch (type) {
            case AssetLoader.CSS:
                el = $.qs('link[href="' + href + '"]');
                if (!el) {
                    el = $.el('link');
                }
                return $.prop(el, {
                    rel: 'stylesheet',
                    type: 'text/css',
                    href 
                });

            case AssetLoader.JS:
                el = $.qs('script[src="' + href + '"]');
                if (!el) {
                    el = $.el('script');
                }
                return $.prop(el, {
                    async: true,
                    src: href
                });

            default:
                throw new Error(`Bad asset type: ${type}`);
        }
    }
}
