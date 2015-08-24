import gulp from 'gulp';
import less from 'gulp-less';
import autoprefixer from 'gulp-autoprefixer';
import minifyCSS from 'gulp-minify-css';


export default function () {
    return gulp.src('./src/less/editor.less')
        .pipe(less())
        .pipe(autoprefixer())
        .pipe(minifyCSS())
        .pipe(gulp.dest('./src/dialogs'))
    ;
}
