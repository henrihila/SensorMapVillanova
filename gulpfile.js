var gulp = require('gulp');
var watch = require('gulp-watch');
var shell = require('gulp-shell');
var autoprefixer = require('gulp-autoprefixer');
var concat = require('gulp-concat');
var sass   = require('gulp-sass');
var minCss = require('gulp-minify-css');
var rename = require('gulp-rename');

// Scss to css
gulp.task('sass', function () {
	var config = {};
	config.outputStyle = 'compressed';

	return gulp.src('public/styles/*.scss')
		.pipe(sass(config).on('error', sass.logError))

		.pipe(autoprefixer())
		.pipe(gulp.dest('public/styles/'))
		.pipe(minCss())
		.pipe(rename({ extname: '.min.css' }))
		.pipe(gulp.dest('public/styles/'));

});

gulp.task('watch', function() {
	gulp.watch('public/styles/*.scss', ['sass']);
});

gulp.task('default', ['sass', 'watch']);