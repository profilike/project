var gulp        = require('gulp'),
	 sass         = require('gulp-sass'),
	 autoprefixer = require('gulp-autoprefixer'),
	 cssnano      = require('gulp-cssnano'),
	 rename       = require('gulp-rename'),
	 uglify       = require('gulp-uglifyjs'),
	 concat       = require('gulp-concat'),
	 imagemin     = require('gulp-imagemin'),
    pngquant     = require('imagemin-pngquant'),
	 cache        = require('gulp-cache'),
	 del          = require('del'),
	 browserSync  = require('browser-sync').create();

gulp.task('browser-sync', ['styles', 'csslibs', 'scripts'], function() {
	browserSync.init({
		//proxy: "http://project/",
		server: {
			baseDir: "./app"
		},
			notify: false
	});
});

gulp.task('clean', function(){
   return del.sync('dist');
});

gulp.task('clear', function(){
   return cache.clearAll();
});

gulp.task('styles', function () {
	return gulp.src('app/sass/*.+(scss|sass)')
	//return gulp.src(['!app/sass/main.sass','app/sass/**/*.sass']))
	.pipe(sass({
		includePaths: require('bourbon').includePaths
	}).on('error', sass.logError))
	.pipe(autoprefixer(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], {cascade: true}))
	.pipe(gulp.dest('app/css'))
	.pipe(browserSync.reload({stream: true}))
});

gulp.task('csslibs',['styles'], function(){
   return gulp.src('app/css/libs.css')
   .pipe(cssnano())
   .pipe(rename({suffix: ".min"}))
   .pipe(gulp.dest('app/css'));
});

gulp.task('scripts', function() {
	return gulp.src([
		'./app/libs/modernizr/modernizr.js',
		'./app/libs/jquery/jquery-1.11.2.min.js'
		])
		.pipe(concat('libs.js'))
		.pipe(uglify()) //Minify libs.js
		.pipe(gulp.dest('./app/js/'));
});

gulp.task('img', function(){
   return gulp.src('app/img/**/*')
   .pipe(cache(imagemin({
      interlaced: true,
      progressive: true,
      svgoPlugins: [{removeViewBox: false}],
      use: [pngquant()]
   })))
   .pipe(gulp.dest('dist/img'));
});


gulp.task('watch', function () {
	gulp.watch('app/sass/*.+(scss|sass)', ['styles']);
	gulp.watch('app/libs/**/*.js', ['scripts']);
	gulp.watch('app/js/*.js').on("change", browserSync.reload);
	gulp.watch('app/*.html').on('change', browserSync.reload);
	gulp.watch('app/**/*.php').on('change', browserSync.reload);
});

// gulp.task('build',['clean', 'img', 'styles', 'scripts' ], function(){

//  var buildCss = gulp.src([
//      'app/css/main.css',
//     'app/css/libs.min.css',
//      ])
//      .pipe(gulp.dest('dist/css'));
//   var buildFonts = gulp.src('app/fonts/**/*')
//      .pipe(gulp.dest('dist/fonts'));

//   var buildJs = gulp.src('app/js/**/*')
//      .pipe(gulp.dest('dist/js'));
//   var buildHtml = gulp.src('app/*.html')
//      .pipe(gulp.dest('dist'));
// })

gulp.task('default', ['browser-sync', 'watch']);