var gulp = require('gulp');
var eslint = require('gulp-eslint');
var mocha = require('gulp-mocha');
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

gulp.task('default', ['lint', 'test'], function () {
});