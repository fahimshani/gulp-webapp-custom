var gulp = require('gulp');
var sass = require('gulp-sass');
var notify = require('gulp-notify');
var fileinclude = require('gulp-file-include');
var autoprefixer = require('gulp-autoprefixer');
var sourcemaps = require('gulp-sourcemaps');
var browserSync = require('browser-sync');
var useref = require('gulp-useref');
var uglify = require('gulp-uglify');
var gulpIf = require('gulp-if');
var cssnano = require('gulp-cssnano');
var imagemin = require('gulp-imagemin');
var cache = require('gulp-cache');
var del = require('del');
var copy = require('gulp-contrib-copy');
var merge = require('merge-stream');
var clean = require('gulp-clean');
var htmlmin = require('gulp-htmlmin');
var minify = require('gulp-minifier');
//var uncss = require('gulp-uncss');
//var nano = require('gulp-cssnano');
var runSequence = require('run-sequence');


var srcDir = 'source/',
    devDir = 'dev/',
    prodDir = 'prod/',
    tmpDir = '.tmp/';

// Start browserSync server

// Source Tasks
    // Copy Files & Folders
    gulp.task('copy', function() {
       gulp.src(srcDir+'scripts/**/*.*')
       .pipe(gulp.dest(tmpDir+'/js'));

       gulp.src(srcDir+'fonts/**/*.*')
       .pipe(gulp.dest(tmpDir+'/fonts'));

       gulp.src(srcDir+'images/**/*.*')
       .pipe(gulp.dest(tmpDir+'/imgs'));

    });

    gulp.task('sass', function() {
      return gulp.src(srcDir+'/scss/**/*.scss')
        .pipe(sass())
        .pipe(autoprefixer())
        //.pipe(gulp.dest(devDir+'/css/'))
        .pipe(gulp.dest(tmpDir+'/css/'))
        .pipe(browserSync.reload({
          stream: true
        }))
        .pipe(notify({ message: 'sass task completed', onLast: true }));
    });

    gulp.task('fileinclude', function() {
      gulp.src([srcDir+'*.html'])
        .pipe(fileinclude({
          prefix: '@@',
          basepath: '@file'
        }))
        .pipe(gulp.dest(tmpDir))
        //.pipe(gulp.dest(devDir))
        .pipe(browserSync.reload({
          stream: true
        }));
    });

    // Watchers
    gulp.task('watch', function() {
      gulp.watch(srcDir+'scss/**/*.scss', ['sass'], browserSync.reload);
      gulp.watch(srcDir+'**/*.html', ['fileinclude'],  browserSync.reload);
      gulp.watch(srcDir+'js/**/*.js', browserSync.reload);
      gulp.watch(srcDir+'images/**/', ['images'],  browserSync.reload);
      // Watch any files in dist/, reload on change
      // gulp.watch([devDir]).on('change', function() {
      // 	browserSync.reload
      // });
    });

    gulp.task('browserSync', function() {
      browserSync({
        server: {
          baseDir: ['.tmp/']
        }
      })
    });


// Source Tasks End

// Source build Sequences

gulp.task('default', function(callback) {
  runSequence(['copy', 'sass', 'fileinclude', 'browserSync', 'watch'],
    callback
  )

});


// Development Tasks
    // Clean Development directory
    gulp.task('clean:dev', function () {
        return gulp.src(devDir, {read: false})
              .pipe(clean());
    });
    gulp.task('copyAlltoDev', function(){
      gulp.src(tmpDir+'/**/*')
      .pipe(gulp.dest(devDir));
    });

// Development Tasks End
// Development build Sequences
gulp.task('dev', function(callback) {
  'clean:dev',
  runSequence(['copyAlltoDev', 'browserSync'],
    callback
  )
});

// Production Tasks

    // Clean Production directory
    gulp.task('clean:prod', function () {
        return gulp.src(prodDir, {read: false})
              .pipe(clean());
    });

    // Optimizing CSS and JavaScript
    gulp.task('useref', function() {

      return gulp.src(devDir+'/*.html')
        .pipe(useref())
        .pipe(gulpIf('*.js', uglify()))
        .pipe(gulpIf('*.css', cssnano()))
        .pipe(gulp.dest(prodDir));
        .pipe(notify({ message: 'codes minification completed', onLast: true }));
    });

    gulp.task('copyAssets:prod', function() {
       gulp.src(devDir+'fonts/**/*.*')
       .pipe(gulp.dest(prodDir+'/fonts'));
       .pipe(notify({ message: 'Assets copied to production', onLast: true }));
    });

    gulp.task('minify', function() {
      return gulp.src(devDir+'/**/*').pipe(minify({
        minify: true,
        collapseWhitespace: true,
        conservativeCollapse: true,
        minifyJS: true,
        minifyCSS: true,
        getKeptComment: function (content, filePath) {
            var m = content.match(/\/\*![\s\S]*?\*\//img);
            return m && m.join('\n') + '\n' || '';
        }
      }))
      // .pipe(clean())
      .pipe(gulp.dest(prodDir))
      .pipe(notify({ message: 'Code minification process completed', onLast: true}));
    });

    // Images
    gulp.task('images', function() {
      return gulp.src(devDir+'/imgs/**/*')
        .pipe(cache(imagemin({ optimizationLevel: 3, progressive: true, interlaced: true })))
        .pipe(gulp.dest(prodDir+'/imgs'))
        .pipe(notify({ message: 'Images task completed', onLast: true }));
    });

    gulp.task('browserSync:prod', function() {
      browserSync({
        server: {
          baseDir: 'prod/'
        }
      })
    });

// Production taks ened

gulp.task('prod', function(callback) {
  'clean:prod',
  runSequence(['copyAssets:prod', 'images', 'useref', 'browserSync:prod'],
    callback
  )
});
