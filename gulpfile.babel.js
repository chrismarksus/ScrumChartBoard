const gulp = require('gulp');
const gulpLoadPlugins = require('gulp-load-plugins');
const browserSync = require('browser-sync').create();
const del = require('del');
const wiredep = require('wiredep').stream;
const cleanCSS = require('gulp-clean-css');
const through2 = require('through2');
const path = require('path');

const $ = gulpLoadPlugins();
const reload = browserSync.reload;

var dev = true;

// --- Leaf tasks (no dependencies) ---

gulp.task('clean', () => del(['.tmp', 'dist']));

gulp.task('wiredep', (done) => {
  gulp.src('app/styles/*.less')
    .pipe($.filter(file => file.stat && file.stat.size))
    .pipe(wiredep({ ignorePath: /^(\.\.\/)+/ }))
    .pipe(gulp.dest('app/styles'));

  gulp.src('app/*.html')
    .pipe(wiredep({ ignorePath: /^(\.\.\/)*\.\./ }))
    .pipe(gulp.dest('app'));

  done();
});

gulp.task('styles', () => {
  return gulp.src('app/styles/*.less')
    .pipe($.plumber())
    .pipe($.sourcemaps.init())
    .pipe($.less({ paths: ['.'] }))
    .pipe($.sourcemaps.write())
    .pipe(gulp.dest('.tmp/styles'))
    .pipe(reload({ stream: true }));
});

gulp.task('scripts', () => {
  return gulp.src('app/scripts/**/*.js')
    .pipe($.plumber())
    .pipe($.sourcemaps.init())
    .pipe($.babel())
    .pipe($.sourcemaps.write('.'))
    .pipe(gulp.dest('.tmp/scripts'))
    .pipe(reload({ stream: true }));
});

function defineTemplate() {
  return through2.obj((file, enc, cb) => {
    const name = path.basename(file.path, '.js');
    const content = file.contents.toString();
    const ns = `this["App"] = this["App"] || {};\nthis["App"]["templates"] = this["App"]["templates"] || {};\nthis["App"]["templates"]["${name}"] = Handlebars.template(${content});\n`;
    file.contents = Buffer.from(ns);
    cb(null, file);
  });
}

gulp.task('templates', () => {
  return gulp.src('app/templates/**/*.hbs')
    .pipe($.handlebars())
    .pipe(defineTemplate())
    .pipe(gulp.dest('.tmp/templates'));
});

gulp.task('fonts', () => {
  return gulp.src(require('main-bower-files')('**/*.{eot,svg,ttf,woff,woff2}', function(err) {})
    .concat('app/fonts/**/*'))
    .pipe($.if(dev, gulp.dest('.tmp/fonts'), gulp.dest('dist/fonts')));
});

gulp.task('mockData', () => {
  return gulp.src('test/data.js')
    .pipe(gulp.dest('.tmp/'));
});

gulp.task('sampleData', () => {
  return gulp.src('test/teams/**/*')
    .pipe(gulp.dest('.tmp/teams'));
});

gulp.task('images', () => {
  return gulp.src('app/images/**/*')
    .pipe(gulp.dest('dist/images'));
});

gulp.task('extras', () => {
  return gulp.src(['app/*', '!app/*.html'], { dot: true })
    .pipe(gulp.dest('dist'));
});

// --- Composite tasks ---

gulp.task('html', gulp.series(
  gulp.parallel('styles', 'templates', 'scripts'),
  () => {
    return gulp.src('app/*.html')
      .pipe($.useref({ searchPath: ['.tmp', 'app', '.'] }))
      .pipe($.if('*.js', $.uglify()))
      .pipe($.if('*.css', cleanCSS()))
      .pipe(gulp.dest('dist'));
  }
));

gulp.task('build', gulp.series(
  gulp.parallel('html', 'images', 'fonts', 'extras'),
  () => gulp.src('dist/**/*').pipe($.size({ title: 'build', gzip: true }))
));

gulp.task('default', gulp.series(
  (done) => { dev = false; done(); },
  gulp.parallel('clean', 'wiredep'),
  'build'
));

gulp.task('serve', gulp.series(
  gulp.parallel('clean', 'wiredep'),
  gulp.parallel('styles', 'templates', 'scripts', 'fonts', 'mockData', 'sampleData'),
  () => {
    browserSync.init({
      notify: false,
      port: 9000,
      server: {
        baseDir: ['.tmp', 'app'],
        routes: { '/bower_components': 'bower_components' }
      }
    });

    gulp.watch(['app/*.html', 'app/templates/**/*.hbs', 'app/images/**/*', '.tmp/fonts/**/*']).on('change', reload);
    gulp.watch('app/styles/**/*.less', gulp.series('styles'));
    gulp.watch('app/scripts/**/*.js', gulp.series('scripts'));
    gulp.watch('app/fonts/**/*', gulp.series('fonts'));
    gulp.watch('app/templates/**/*.hbs', gulp.series('templates'));
    gulp.watch('bower.json', gulp.series('wiredep', 'fonts'));
  }
));

gulp.task('serve:dist', gulp.series('default', () => {
  browserSync.init({
    notify: false,
    port: 9000,
    server: { baseDir: ['dist'] }
  });
}));

gulp.task('serve:test', gulp.series(
  gulp.parallel('scripts', 'templates'),
  () => {
    browserSync.init({
      notify: false,
      port: 9000,
      ui: false,
      server: {
        baseDir: 'test',
        routes: {
          '/scripts': '.tmp/scripts',
          '/templates': '.tmp/templates',
          '/bower_components': 'bower_components'
        }
      }
    });

    gulp.watch(['test/index.html', 'app/scripts/**/*.js', 'app/templates/**/*.hbs', 'test/spec/**/*.js']).on('change', reload);
    gulp.watch('app/scripts/**/*.js', gulp.series('scripts'));
    gulp.watch('app/templates/**/*.hbs', gulp.series('templates'));
  }
));
