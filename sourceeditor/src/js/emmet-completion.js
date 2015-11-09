import CodeMirror from 'codemirror';
import emmetCodeMirror from 'emmet-codemirror';


const resources = emmetCodeMirror.emmet.resources
    , vocab = resources.getVocabulary('system')
    , wrapped = {
        html: CodeMirror.hint.html
        , css: CodeMirror.hint.css
    }
;

function findSnippets (word, type)
{
    return resources.fuzzyFindMatches(type, word).map(snip => {
        const {key, value} = snip;
        return {
            text: key,
            displayText: `${key} (${value.value})`,
            className: 'emmet-snippet',
            type: 'emmet'
        };
    });
}

function bind (cm, result)
{
    CodeMirror.on(result, 'pick', completion => {
        if (completion.type === 'emmet') {
            cm.execCommand('emmet.expand_abbreviation');
        }
    });

    return result;
}

function safeResult (res, set)
{
    res.from = res.from || set.from;
    res.to = res.to || set.to;
    res.hint = res.hint || set.hint;
}

function aggregate (target, other)
{
    const empty = {list: []};
    target = target || empty;
    other = other || empty;

    target.list.forEach(r => safeResult(r, target));
    other.list.forEach(r => safeResult(r, other));

    return {
        list: target.list.concat(other.list)
    };
}

CodeMirror.registerHelper('hint', 'html', (cm, options) => {
    const cur = cm.getCursor()
        , token = cm.getTokenAt(cur)
    ;
    // we are in a special html token, just
    if (token.type !== null) {
        return wrapped.html(cm, options);
    }

    const start = token.start
        , end = cur.ch
        , word = token.string.slice(0, end - start)
    ;
    return bind(cm, {
        list: findSnippets(word, 'html')
        , from: CodeMirror.Pos(cur.line, start)  // eslint-disable-line new-cap
        , to: CodeMirror.Pos(cur.line, end)      // eslint-disable-line new-cap
    });
});

CodeMirror.registerHelper('hint', 'css', (cm, options) => {
    const cur = cm.getCursor()
        , token = cm.getTokenAt(cur)
        , tokens = cm.getLineTokens(cur.line)
    ;
    var word = '', start, end;
    for (let t, i = tokens.length - 1; i >= 0; i--) {
        t = tokens[i];
        if (t.end > token.end) {
            continue;
        }
        if (t.type === null && t.string !== ':') {
            break;
        }
        if (!end) {
            end = t.end;
        }
        start = t.start;
        word = t.string + word;
    }
    if (!word) {
        return wrapped.css(cm, options);
    }

    return bind(cm, aggregate({
        list: findSnippets(word, 'css')
        , from: CodeMirror.Pos(cur.line, start)  // eslint-disable-line new-cap
        , to: CodeMirror.Pos(cur.line, end)       // eslint-disable-line new-cap
    }, wrapped.css(cm, options)));
});

