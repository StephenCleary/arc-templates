var gulp = require('gulp');
var eslint = require('gulp-eslint');
var mocha = require('gulp-mocha');
var sourcemaps = require('gulp-sourcemaps');
var babel = require('gulp-babel');
require('babel/register');

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

gulp.task('compile-src', function () {
    return gulp.src(['src/**/*.js'])
        .pipe(sourcemaps.init())
        .pipe(babel({ optional: ['runtime'] }))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('dist/src'));
});

gulp.task('compile-index', function () {
    return gulp.src(['index.js'])
        .pipe(sourcemaps.init())
        .pipe(babel({ optional: ['runtime'] }))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('dist'));
});

gulp.task('compile', ['compile-index', 'compile-src'], function () { });

gulp.task('default', ['lint', 'test', 'compile'], function () { });