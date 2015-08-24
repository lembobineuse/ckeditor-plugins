import gulp from "gulp";
import gutil from 'gulp-util';
import gulpif from 'gulp-if';

import del from 'del';
import {exec} from 'child_process';

import browserify from 'browserify';
import watchify from 'watchify';
import babelify from 'babelify';
import source from 'vinyl-source-stream';
import buffer from 'vinyl-buffer';
import sourcemaps from 'gulp-sourcemaps';
import uglify from 'gulp-uglify';
import webserver from 'gulp-webserver';


import emmet from './gulp/emmet.js';
import {
    codemirror,
    codemirrorCSS,
    codemirrorThemes,
    codemirrorKeymaps
} from './gulp/codemirror.js';
import css from './gulp/less.js';
import getBundler from './gulp/app.js';
import dist from './gulp/dist.js';


const VERSION = '0.0.1';

const DEBUG = !gutil.env.prod && !(gutil.env._[0] === 'dist');
console.log(DEBUG);

const js_bundler = getBundler(DEBUG);

//
// ======================== Tasks
//

gulp.task('default', ['watch']);

gulp.task('build', ['vendors', 'less', 'js'], done => done());

gulp.task('js', done => js_bundler.bundle());
gulp.task('less', css);

gulp.task('watch', ['js', 'less'], () => {
    js_bundler.watchify();
    gulp.watch('src/js/**/*.js', ['js']);
    gulp.watch('src/less/**/*.less', ['less']);
});

gulp.task('clean', done => {
    del([
        './dist/source-editor/*',
        './dist/*.zip'
    ], done);
});

gulp.task('emmet', done => emmet(DEBUG));
gulp.task('codemirror', ['cm-css', 'cm-themes', 'cm-keymaps', 'cm-js'], done => done());
gulp.task('cm-js', done => codemirror(DEBUG));
gulp.task('cm-css', done => codemirrorCSS());
gulp.task('cm-themes', done => codemirrorThemes());
gulp.task('cm-keymaps', done => codemirrorKeymaps());
gulp.task('vendors', ['codemirror', 'emmet'], done => done());
gulp.task('dist', ['clean', 'vendors', 'build'], done => dist(VERSION, done));
gulp.task('server', () => {
    gulp.src('.')
        .pipe(webserver({
            livereload: true,
            directoryListing: true,
            fallback: 'index.html'
        }))
    ;
});
