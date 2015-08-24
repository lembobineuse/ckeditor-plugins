import gulp from 'gulp';
import gulpif from 'gulp-if';
import gutil from 'gulp-util';
import concat from 'gulp-concat';
import sourcemaps from 'gulp-sourcemaps';
import uglify from 'gulp-uglify';
import minifyCSS from 'gulp-minify-css';
import rename from 'gulp-rename';

import browserify from 'browserify';
import watchify from 'watchify';
import babelify from 'babelify';
import source from 'vinyl-source-stream';
import buffer from 'vinyl-buffer';


const EXTERNALS = [
    'codemirror',
    'emmet-codemirror'
];

class Bundler
{
    constructor (debug) {
        this.debug = debug;
        this.bundler = browserify({
            // Required watchify args
            cache: {}, packageCache: {}, fullPaths: debug,
            entries: ['src/js/app.js'],
            extensions: ['js'],
            debug: debug
        });

        this.bundler.external(EXTERNALS);

        this.bundler
            .transform(babelify.configure({
                stage: 0
                //, optional: ['runtime']
            }))
            .transform('browserify-shim')
        ;

        this.bundler.on('update', ::this.bundle);
        this.bundler.on('log', gutil.log.bind(gutil, 'Browserify:'));
    }

    bundle () {
        return this.bundler.bundle()
            .on('error', function(err) {
                gutil.log('Browserify error: ', err);
                this.emit('end');
            })
            .pipe(source('app.js'))
            .pipe(buffer())
            .pipe(sourcemaps.init({loadMaps: true}))
                .pipe(gulpif(!this.debug, (...args) => {
                    console.log(args);
                    return uglify();
                }))
                .on('error', gutil.log)
            .pipe(sourcemaps.write('./'))
            .pipe(gulp.dest('src/dialogs'))
        ;
    }

    watchify () {
        this.bundler = watchify(this.bundler);
    }
}

export default function factory (debug=true)
{
    return new Bundler(debug);
}
