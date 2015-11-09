import CodeMirror from 'codemirror';

import $ from './dom.js';
import SearchManager from './search-manager.js';


export default class SearchUI
{
    constructor (cm) {
        this._cm = cm;
        this._search = new SearchManager(cm);
        this._panel = null;

        this._subject = '';
        this._searchTimeout = 0;

        this._init();
    }

    open () {
        this._clearSearch();
        const sel = this._cm.getSelection();
        if (sel) {
            this.ui.search_input.value = sel;
            this._setSubject(sel);
            this._search.highlight();
        }
        this.show();
    }

    close () {
        this._clearSearch();
        this.hide();
    }

    show () {
        this._panel = this._cm.addPanel(this.ui.toolbar, {
            position: 'before-bottom'
        });
        this.ui.search_input.focus();
        this.ui.search_input.select();
    }

    hide () {
        if (this._panel) {
            this._panel.clear();
        }
        this._cm.focus();
    }

    _setSubject (value) {
        this._subject = value;
        this._search.subject = value;
    }

    _clearSearch () {
        this._subject = '';
        this._search.clear();
    }

    _onSearchKeyPress () {
        const value = this.ui.search_input.value
            , reverse = this._subject && value.length < this._subject.length
        ;
        if (!value) {
            this._subject = '';
            this._clearSearch();
            return;
        }
        this._setSubject(value);
        this._search.highlight();
        this._search.findNext(reverse, true);
    }

    _init () {
        this._setupDOM();

        $.on(document, 'keydown', e => {
            // ESC hides search toolbar
            if (e.keyCode === 27) {
                this.hide();
                this._clearSearch();
            }
        });

        // Search patterns
        $.on(this.ui.search_input, 'keydown', e => {
            if (e.keyCode === 27) { // Escape
                // prevent interfering with fullscreen
                e.preventDefault();
                e.stopPropagation();

                this.hide();
                this._clearSearch();
                return false;
            }
        })
        $.on(this.ui.search_input, 'keypress', e => {
            if (this._searchTimeout) {
                clearTimeout(this._searchTimeout);
            }
            var chr = e.charCode,
                key = e.keyCode,
                value = e.target.value
            ;
            // Enter key === doitnow, Shift+Enter in reverse
            if (key === 13) {
                this._setSubject(value);
                e.shiftKey ? this._search.findPrev() : this._search.findNext();
                return;
            }
            // We only care about keys that actually change the input
            // character or Backspace, Delete
            if (chr || key === 8 || key === 46) {
                this._searchTimeout = setTimeout(() => {
                    this._onSearchKeyPress(e);
                }, 150);
            }
        });

        $.on(this.ui.replace_input, 'change', e => {
            this._search.replacement = e.target.value;
        });

        // Search options
        [
            this.ui.regex_toggle
            , this.ui.matchcase_toggle
            , this.ui.wholewords_toggle
            , this.ui.wrap_toggle
            , this.ui.inselection_toggle
        ].forEach(input => $.on(input, 'change', e => {
            // toggle parent button active state
            input.parentNode.classList[input.checked ? 'add' : 'remove']('active');
        }));

        $.on(this.ui.regex_toggle, 'change', e => {
            this._search.options.regexp = e.target.checked;
            this._setSubject(this.ui.search_input.value);
            if (this._subject) {
                this._search.highlight();
                this._search.findNext(true);
            }
        });
        $.on(this.ui.matchcase_toggle, 'change', e => {
            this._search.options.matchCase = e.target.checked;
            this._setSubject(this.ui.search_input.value);
            if (this._subject) {
                this._search.highlight();
                this._search.findNext(true);
            }
        });
        $.on(this.ui.wholewords_toggle, 'change', e => {
            this._search.options.wholeWords = e.target.checked;
            this._setSubject(this.ui.search_input.value);
            if (this._subject) {
                this._search.highlight();
                this._search.findNext(true);
            }
        });
        $.on(this.ui.wrap_toggle, 'change', e => {
            let input = e.target;
            this._search.options.wrap = input.checked;
        });
        $.on(this.ui.inselection_toggle, 'change', e => {
            this._search.options.inSelection = e.target.checked;
        });

        // Actions
        $.on(this.ui.next_btn, 'click', () => {
            this._search.findNext();
        });
        $.on(this.ui.prev_btn, 'click', () => {
            this._search.findPrev();
        });
        $.on(this.ui.replace_btn, 'click', () => {
            this._search.replaceNext();
        });
        $.on(this.ui.replaceall_btn, 'click', () => {
            this._search.replaceAll();
        });

        // Bind CodeMirror commands
        CodeMirror.commands.find = () => this.open();
        CodeMirror.commands.clearSearch = () => this.close();

        CodeMirror.commands.findNext = () => {
            if (!this._search.subject) {
                this.open();
            } else {
                this._search.findNext();
            }
        };
        CodeMirror.commands.findPrev = () => {
            if (!this._search.subject) {
                this.open();
            } else {
                this._search.findPrev();
            }
        };

        CodeMirror.commands.replace = () => {
            if (!this._search.subject || !this._search.replacement) {
                this.open();
            } else {
                this._search.replaceNext();
            }
        };
        CodeMirror.commands.replaceAll = () => {
            if (!this._search.subject || !this._search.replacement) {
                this.open();
            } else {
                this._search.replaceAll();
            }
        };
    }
    
    _setupDOM () {
        const toolbar = $.el('div', {
            id: 'search-panel'
            , 'class': 'hbox cm-panel'
        });
        toolbar.innerHTML = $.id('searchbar-tpl').innerHTML;
        this.ui = {
            toolbar: toolbar
            , search_input: $.qs('#search-input', toolbar)
            , replace_input: $.qs('#replace-input', toolbar)
            , regex_toggle: $.qs('#search-regex', toolbar)
            , matchcase_toggle: $.qs('#search-matchcase', toolbar)
            , wholewords_toggle: $.qs('#search-wholewords', toolbar)
            , wrap_toggle: $.qs('#search-wrap', toolbar)
            , inselection_toggle: $.qs('#search-inselection', toolbar)
            , next_btn: $.qs('#search-next', toolbar)
            , prev_btn: $.qs('#search-prev', toolbar)
            , replace_btn: $.qs('#search-replace', toolbar)
            , replaceall_btn: $.qs('#search-replace-all', toolbar)
        };
    }
}
