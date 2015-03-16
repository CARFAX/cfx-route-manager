var gulp = require('gulp'),
    concat = require('gulp-concat'),
    rename = require('gulp-rename'),
    uglify = require('gulp-uglify');

gulp.task('browserify', function() {
    gulp.src('./src/**/*.js')
        .pipe(concat('cfx-route-manager.js'))
        .pipe(gulp.dest('./dist'))
        .pipe(uglify())
        .pipe(rename('cfx-route-manager.min.js'))
        .pipe(gulp.dest('./dist'));
});

gulp.task('watch', function() {
    gulp.watch('src/**/*.js', ['compile']);
});

gulp.task('compile', ['browserify']);
gulp.task('default', ['compile', 'watch']);