var gulp         = require('gulp'),
	 gutil        = require('gulp-util' ),
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
	 browserSync  = require('browser-sync').create(),
	 ftp          = require('vinyl-ftp');
	

gulp.task('browser-sync', ['sass', 'csslibs', 'scripts'], function() {
	browserSync.init({
		//proxy: "http://project/",
		server: {
			baseDir: "./app"
		},
			notify: false
	});
});

gulp.task('sass', function () {
	return gulp.src('app/sass/*.+(scss|sass)')
	//return gulp.src(['!app/sass/main.sass','app/sass/**/*.sass']))
	.pipe(sass({
		includePaths: require('bourbon').includePaths
	}).on('error', sass.logError))
	.pipe(autoprefixer(['last 15 versions'], {cascade: true}))
	.pipe(gulp.dest('app/css'))
	.pipe(browserSync.reload({stream: true}))
});

gulp.task('csslibs',['sass'], function(){
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

gulp.task('watch', function () {
	gulp.watch('app/sass/*.+(scss|sass)', ['sass']);
	gulp.watch('app/libs/**/*.js', ['scripts']);
	gulp.watch('app/js/*.js').on("change", browserSync.reload);
	gulp.watch('app/*.html').on('change', browserSync.reload);
	gulp.watch('app/**/*.php').on('change', browserSync.reload);
});

gulp.task('default', ['browser-sync', 'watch']);

//******************************
// additional tasks
//******************************

gulp.task('removedist', function() { return del.sync('dist'); });

gulp.task('imgmin', function(){
   return gulp.src('app/img/**/*')
   .pipe(cache(imagemin({
      interlaced: true,
      progressive: true,
      svgoPlugins: [{removeViewBox: false}],
      use: [pngquant()]
   })))
   .pipe(gulp.dest('dist/img'));
});

gulp.task('build',['removedist', 'imgmin', 'sass', 'scripts' ], function(){

	var buildhtml = gulp.src([
		'app/*.html',
		'app/.htaccess',
		]).pipe(gulp.dest('dist'));

 	var buildCss = gulp.src([
     'app/css/main.css',
    'app/css/libs.min.css',
     ])
     .pipe(gulp.dest('dist/css'));

  var buildFonts = gulp.src('app/fonts/**/*')
     .pipe(gulp.dest('dist/fonts'));

  var buildJs = gulp.src('app/js/**/*')
     .pipe(gulp.dest('dist/js'));
});


gulp.task('deploy', function() {

	var conn = ftp.create({
		host:      'hostname.com',
		user:      'username',
		password:  'userpassword',
		parallel:  10,
		log: gutil.log
	});

	var globs = [
		'dist/**',
		'dist/.htaccess',
	];
	return gulp.src(globs, {buffer: false})
	.pipe(conn.dest('/path/to/folder/on/server'));

});

gulp.task('clearcache', function () { return cache.clearAll(); });

