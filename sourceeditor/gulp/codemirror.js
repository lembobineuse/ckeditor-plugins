import gulp from 'gulp';
import gulpif from 'gulp-if';
import gutil from 'gulp-util';
import concat from 'gulp-concat';
import sourcemaps from 'gulp-sourcemaps';
import uglify from 'gulp-uglify';
import minifyCSS from 'gulp-minify-css';
import rename from 'gulp-rename';

import browserify from 'browserify';
import babelify from 'babelify';
import source from 'vinyl-source-stream';
import buffer from 'vinyl-buffer';


const CSS = [
    'node_modules/codemirror/lib/codemirror.css'
    , 'node_modules/codemirror/addon/hint/show-hint.css'
    , 'node_modules/codemirror/addon/dialog/dialog.css'
    , 'node_modules/codemirror/addon/fold/foldgutter.css'
];


export function codemirror (debug=false) {
    var bundler = browserify({
        debug: debug,
        entries: ['./src/js/codemirror.js'],
        standalone: 'CodeMirror',
        extensions: ['js']
    });
    bundler.transform({
        stage: 0,
        only: /src\/js\/codemirror\.js/
    }, babelify);
    return bundler
        .bundle()
        .pipe(source('codemirror.js'))
        .pipe(buffer())
        .pipe(sourcemaps.init({loadMaps: true}))
            .pipe(gulpif(!debug, uglify()))
            .on('error', err => gutil.log(err))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('src/vendor'))
    ; 
}

export function codemirrorCSS () {
    return gulp.src(CSS)
        .pipe(concat('codemirror.min.css'))
        .pipe(minifyCSS())
        .pipe(gulp.dest('./src/vendor/codemirror'))
    ;
};

export function codemirrorThemes () {
    return gulp.src('node_modules/codemirror/theme/*.css')
        .pipe(minifyCSS())
        .pipe(rename({extname: '.min.css'}))
        .pipe(gulp.dest('./src/vendor/codemirror/theme'))
    ;
};

export function codemirrorKeymaps () {
    return gulp.src('node_modules/codemirror/keymap/*.js')
        .pipe(uglify())
        .pipe(rename({extname: '.min.js'}))
        .pipe(gulp.dest('./src/vendor/codemirror/keymap'))
    ;
};
