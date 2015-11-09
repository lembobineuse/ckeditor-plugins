import CodeMirror from 'codemirror';
import emmetCodeMirror from 'emmet-codemirror';
import beautify from 'js-beautify';

import AssetLoader from './asset-loader.js';
import SearchUI from './search-ui.js';


const THEMES_PATH = 'vendor/codemirror/theme/';
const KEYMAPS_PATH = 'vendor/codemirror/keymap';
const MODES_PATH = 'vendor/codemirror/mode';
const ADDONS_PATH = 'vendor/codemirror/addon';
const DEFAULTS = {
    mode: 'htmlmixed'
    , profile: 'xhtml'
    , theme: 'default'
    , keyMap: 'default'
    , lineNumbers: true
    , lineWrapping: false
    , foldGutter: true
    , gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"]
    , smartIndent: true
    , indentUnit: 4
    , indentWithTabs: false
    , matchBrackets: true
    , matchTags: true
    , readOnly: false
    , autoCloseTags: true
    , autoCloseBrackets: true
    , highlightSelectionMatches: true
    , continueComments: true
    , showTrailingSpace: true
    , showCursorWhenSelecting: true
    , styleActiveLine: true
    , viewportMargin: Infinity
    , extraKeys: {
        'Ctrl-Space': 'autocomplete'
    }
};


export default class Editor
{
    constructor (ckeditor, path, config) {
        this._ckeditor = ckeditor;
        this._cm = null;
        this._emmet = null;
        this._search = null;
        this._base_path = path;
        this._previous_value = null;

        this._themeLoader = new AssetLoader(this._base_path + THEMES_PATH);
        this._keymapLoader = new AssetLoader(this._base_path + KEYMAPS_PATH);
        //TODO: these are not actually used
        this._modeLoader = new AssetLoader(this._base_path + MODES_PATH);
        this._addonLoader = new AssetLoader(this._base_path + ADDONS_PATH);

        this._config = {...DEFAULTS, ...config};
    }

    attach (textarea) {
        textarea.value = this._previous_value = this._ckeditor.getData();
        this._cm = CodeMirror.fromTextArea(textarea, this._config);
        emmetCodeMirror(this._cm);
        this._loadPrefs();
        this._search = new SearchUI(this._cm);
        this._cm.focus();
    }

    detach () {
        try {
            emmetCodeMirror.dispose(this._cm);
            this._cm.toTextArea();
        } catch (err) {
            console.log(err);
        }
    }

    commit () {
        const new_data = this._cm.getValue()
            , editor = this._ckeditor
        ;
        if (new_data === this._previous_value) {
            return;
        }
        editor.setData(new_data, () => {
            const range = editor.createRange();
            range.moveToElementEditStart(editor.editable());
            range.select();
        });
    }

    pref (pref, value) {
        if (value === undefined) {
            let val = localStorage.getItem(`embo-cksource-editor-${pref}`);
            if (val === null) {
                return;
            }
            return JSON.parse(val);
        }
        localStorage.setItem(`embo-cksource-editor-${pref}`, JSON.stringify(value));
    }

    setSize (width, height) {
        this._cm.setSize(width, height);
    }

    setFontSize (size) {
        this.pref('font-size', size);
        this._cm.display.wrapper.style.fontSize = `${size}px`;
        this._cm.refresh();
    }

    setTheme (name) {
        if (!name || name === 'default') {
            this._setOption('theme', 'default');
        } else {
            this._loadTheme(name);
        }
    }

    setKeyMap (name) {
        if (name === 'default' || ['sublime', 'vim', 'emacs'].indexOf(name) === -1) {
            this._setOption('keyMap', 'default');
        } else {
            this._loadKeyMap(name);
        }
    }

    beautify () {
        this._cm.operation(() => {
            const src = this._cm.getValue();
            const dest = beautify.html(src, {
                indent_size: 4,
                indent_char: ' ',
                preserve_newlines: false,
                unformatted: ['b', 'i', 'u', 'sub', 'sup'],
                brace_style: 'collapse' // collapse, expand, end-expand
            });
            this._cm.setValue(dest);
        });
    }

    _loadTheme (name) {
        const theme = name.split(' ', 1);
        this._themeLoader.loadCSS(`${theme}.min.css`).then(link => {
            this._setOption('theme', name);
        }).catch(path => {
            console.warn(`No theme named ${name} at path ${path}`);
        });
    }

    _loadKeyMap (name) {
        this._keymapLoader.loadJS(`${name}.min.js`).then(script => {
            this._setOption('keyMap', name);
        }).catch(path => {
            console.warn(`No keymap named ${name} at path ${path}`);
        });
    }

    _loadPrefs () {
        let theme = this.pref('theme');
        if (theme) {
            this.setTheme(theme); 
        }
        let keymap = this.pref('keymap');
        if (keymap) {
            this.setKeyMap(keymap);
        }
        let fontSize = this.pref('font-size');
        if (fontSize) {
            this.setFontSize(fontSize);
        }
    }

    _setOption (opt, val) {
        this._config[opt] = val;
        this.pref(opt, val);
        if (this._cm) {
            this._cm.setOption(opt, val);
        }
    }
}
