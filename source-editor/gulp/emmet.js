import gulp from 'gulp';
import gulpif from 'gulp-if';
import gutil from 'gulp-util';
import sourcemaps from 'gulp-sourcemaps';
import browserify from 'browserify';
import babelify from 'babelify';
import source from 'vinyl-source-stream';
import buffer from 'vinyl-buffer';
import uglify from 'gulp-uglify';


export default function (debug=false) {
    var bundler = browserify({
        debug: debug,
        entries: ['./node_modules/emmet-codemirror/plugin.js'],
        standalone: 'emmetCodeMirror',
        extensions: ['js']
    });
    bundler.transform({
        stage: 0,
        only: /emmet-codemirror/
    }, babelify);
    bundler.ignore('emmet/bundles/caniuse');
    return bundler
        .bundle()
        .pipe(source('emmet-codemirror.js'))
        .pipe(buffer())
        .pipe(sourcemaps.init({loadMaps: true}))
            .pipe(gulpif(!debug, uglify()))
            .on('error', err => gutil.log(err))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('src/vendor'))
    ; 
}
