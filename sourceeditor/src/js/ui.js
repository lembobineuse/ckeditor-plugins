import Screenfull from 'screenfull';

import $ from './dom.js';
import Editor from './editor.js';


export default class UI
{
    constructor (dialog, ckeditor, path, config) {
        this._dialog = dialog;
        this._editor = new Editor(ckeditor, path, config);
        this.ui = {};
    }

    run () {
        this._setupDOM();
        this._editor.attach(this.ui.textarea);
        this._setupToolbar();

        // Connect to CKEditor dialog
        this._dialog.once('ok', () => {
            this._editor.commit();
            this._editor.detach();
        });
        this._dialog.once('cancel', () => {
            this._editor.detach();
        });
        this._dialog.on('resize', () => {
            this.resize();
        });
    }

    _setupToolbar () {
        this._setPrefs();
        this._setupFullScreen();

        $.qsa('input, select', this.ui.toolbar).forEach(el => {
            // Prevent dropdown to collapse when clicking on inputs
            $.on(el, 'click', e => e.stopPropagation());
        });

        $.on(this.ui.format_btn, 'click', e => {
            e.preventDefault();
            this._editor.beautify();
        });

        $.on(this.ui.font_select , 'change', e => {
            this._editor.setFontSize(parseInt(e.target.value, 10));
        });
        $.on(this.ui.theme_select , 'change', e => {
            const {options, selectedIndex} = e.target;
            this._editor.setTheme(options[selectedIndex].value);
        });
        $.on(this.ui.keymap_select , 'change', e => {
            const {options, selectedIndex} = e.target;
            this._editor.setKeyMap(options[selectedIndex].value);
        });

        this._editor._cm.addPanel(this.ui.toolbar, 'top');
    }

    _setupFullScreen () {
        if (!Screenfull.enabled) {
            return;
        }

        $.on(document, Screenfull.raw.fullscreenchange, () => this.resize());

        $.on(this.ui.fullscreen_btn, 'click', e => {
            e.preventDefault();
            Screenfull.toggle(this.ui.main);
        });
    }

    resize () {
        const style = this.ui.main.getBoundingClientRect();
        this._editor.setSize(style.width, style.height);
    }

    _setupDOM () {
        const prefs = $.el('div', {id: 'prefs-panel'});
        prefs.innerHTML = $.id('toolbar-tpl').innerHTML;
        this.ui = {
            main: $.id('main')
            , textarea: $.id('data')
            , toolbar: prefs
            , font_select: $.qs('#select-font', prefs)
            , theme_select: $.qs('#select-theme', prefs)
            , keymap_select: $.qs('#select-keymap', prefs)
            , format_btn: $.qs('#beautify', prefs)
            , fullscreen_btn: $.qs('#fullscreen', prefs)
        };
    }

    _setPrefs () {
        const theme = this._editor.pref('theme')
            , keymap = this._editor.pref('keymap')
            , fontSize = this._editor.pref('font-size')
            , theme_opt = $.qs(`option[value="${theme}"]`, this.ui.theme_select)
            , keymap_opt = $.qs(`option[value="${keymap}"]`, this.ui.keymap_select)
        ;
        if (theme_opt) {
            theme_opt.selected = true;
        }
        if (keymap_opt) {
            keymap_opt.selected = true;
        }
        this.ui.font_select.value = fontSize;
    }
}
