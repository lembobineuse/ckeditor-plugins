import gulp from 'gulp';
import gutil from 'gulp-util';
import {exec} from 'child_process';


function execPromise(cmd, opts={}) {
    return new Promise((resolve, reject) => {
        exec(cmd, opts, err => {
            if (err !== null) {
                gutil.log(err, cmd, opts);
                reject(err);
            }
            resolve();
        });
    });
}


function copy () {
    return execPromise(
        'cp -R src/dialogs src/icons src/lang src/vendor src/plugin.js dist/sourceeditor'
    );
}

function compress (version) {
    return execPromise(
        `zip -r -9 sourceeditor-${version}.zip sourceeditor -x \*.map`,
        {cwd: './dist'},
    );
}

export default function (version, done) {
    copy()
        .then(() => compress(version))
        .then(() => done())
        .catch(err => done())
    ;
}
