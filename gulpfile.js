var gulp = require('gulp');
var eslint = require('gulp-eslint');
var mocha = require('gulp-mocha');
var sourcemaps = require('gulp-sourcemaps');
var babel = require('gulp-babel');
require('babel-core/register');

gulp.task('lint', function () {
    return gulp.src(['src/**/*.js'])
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failOnError());
});

gulp.task('test', function () {
    return gulp.src(['test/**/*.js'], { read: false })
        .pipe(mocha({ bail: true }));
});

gulp.task('compile-es5-index', function () {
    return gulp.src(['index.js'])
        .pipe(sourcemaps.init())
        .pipe(babel({ optional: ['runtime'] }))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('dist/es5'));
});

gulp.task('compile-es5-src', function () {
    return gulp.src(['src/**/*.js'])
        .pipe(sourcemaps.init())
        .pipe(babel({ optional: ['runtime'] }))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('dist/es5/src'));
});

gulp.task('compile-node4-index', function () {
    return gulp.src(['index.js'])
        .pipe(sourcemaps.init())
        .pipe(babel({ babelrc: 'node4.babelrc' }))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('dist/node4'));
});

gulp.task('compile-node4-src', function () {
    return gulp.src(['src/**/*.js'])
        .pipe(sourcemaps.init())
        .pipe(babel({ babelrc: 'node4.babelrc' }))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('dist/node4/src'));
});

gulp.task('compile', ['compile-es5-index', 'compile-es5-src', 'compile-node4-index', 'compile-node4-src'], function () { });

gulp.task('default', ['lint', 'test', 'compile'], function () { });