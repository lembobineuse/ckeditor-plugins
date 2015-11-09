const ESCAPE_RX = /[|\\{}()[\]^$+*?.]/g
    , BACKREF_RX = /\$(\d)/g
    , Pos = CodeMirror.Pos
;


function escapePattern (subject)
{
    return subject.replace(ESCAPE_RX, '\\$&');
}


class SearchState
{
    constructor () {
        this.cursor = this.from = this.to = null;
        this.annotate = this.overlay = null;
    }

    updateCursor (cursor) {
        this.cursor = cursor;
        this.from = cursor.from();
        this.to = cursor.to();
    }

    clear () {
        this.cursor = this.from = this.to = null;
        this.annotate = null;
    }
}


class SearchOverlay
{
    constructor (query, ci) {
        if (query instanceof RegExp) {
            this.query = query;
        } else {
            this.query = new RegExp(escapePattern(query), ci ? 'gi' : 'g');
        }
    }

    token (stream) {
        this.query.lastIndex = stream.pos;
        const match = this.query.exec(stream.string);
        if (match && match.index === stream.pos) {
            stream.pos += match[0].length;
            return "searching";
        } else if (match) {
            stream.pos = match.index;
        } else {
            stream.skipToEnd();
        }
    }
}



export default class SearchManager
{
    constructor (cm) {
        this._cm = cm;
        this._state = new SearchState();

        this._subject = null;
        this._replacement = null;

        this.options = {
            matchCase: false
            , regexp: false
            , wrap: true
            , wholeWords: false
            , inSelection: false
        };
    }

    clear () {
        this.unhighlight();
        this._subject = null;
        this._state.clear();
    }

    get subject () {
        return this._subject;
    }

    set subject (subject) {
        const {regexp, wholeWords, matchCase} = this.options;
        var flags = 'g';
        // If we don't need no regexp
        if (!regexp && !wholeWords && matchCase) {
            this._subject = subject;
            return;
        }
        if (!regexp) {
            subject = escapePattern(subject);
        }
        if (wholeWords) {
            subject = `\\b${subject}\\b`;
        }
        if (!matchCase) {
            flags += 'i';
        }
        this._subject = new RegExp(subject, flags);
    }

    get replacement () {
        return this._replacement;
    }

    set replacement (value) {
        this._replacement = value;
    }

    highlight () {
        requestAnimationFrame(() => {
            const {overlay} = this._state;
            if (!overlay || this._subject !== overlay.query) {
                if (overlay) {
                    this._cm.removeOverlay(overlay);
                }
                this._state.overlay = new SearchOverlay(this._subject, !this.options.matchCase);
                this._cm.addOverlay(this._state.overlay);
            }
        });
    }

    unhighlight () {
        this._cm.removeOverlay(this._state.overlay);
        this._state.overlay = null;
    }

    findNext (incremental) {
        if (!this._subject) {
            return;
        }
        return this._find(false, incremental);
    }

    findPrev (incremental) {
        if (!this._subject) {
            return;
        }
        return this._find(true, incremental);
    }

    replaceNext () {
        if (!this._subject || !this._replacement || this._cm.getOption('readOnly')) {
            return;
        }
        this._replace(this._state.cursor);
        this.findNext();
    }

    replaceAll () {
        if (!this._subject || !this._replacement || this._cm.getOption('readOnly')) {
            return;
        }
        this._cm.operation(() => {
            const cursor = this._getSearchCursor();
            while (cursor.findNext()) {
                this._replace(cursor);
            }
        });
    }

    _getSearchCursor (pos) {
        return this._cm.getSearchCursor(this._subject, pos, !this.options.matchCase);
    }

    _find (reverse, incremental) {
        const state = this._state
            , dirs = incremental ? ['to', 'from'] : ['from', 'to']
            , dir = reverse ? dirs[0] : dirs[1]
            , pos = state[dir]
        ;
        let cursor = this._getSearchCursor(pos);
        if (!cursor.find(reverse)) {
            if (!this.options.wrap) {
                return;
            }
            cursor = this._getSearchCursor(
                reverse ? Pos(this._cm.lastLine()) : Pos(this._cm.firstLine(), 0) // eslint-disable-line new-cap
            );
            if (!cursor.find(reverse)) {
                return;
            }
        }
        state.updateCursor(cursor);
        this._cm.setSelection(cursor.from(), cursor.to());
        this._cm.scrollIntoView({
            from: cursor.from(),
            to: cursor.to()
        });
    }

    _replace (cursor, match) {
        if (this._subject instanceof RegExp) {
            if (!match) {
                match = this._cm.getRange(cursor.from(), cursor.to()).match(this._subject);
            }
            cursor.replace(this._replacement.replace(BACKREF_RX, (_, i) => match[i]));
        } else {
            cursor.replace(this._replacement);
        }
    }
}
