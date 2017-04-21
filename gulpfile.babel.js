// generated on 2016-12-16 using generator-webapp 2.3.2
const gulp = require('gulp');
const gulpLoadPlugins = require('gulp-load-plugins');
const browserSync = require('browser-sync').create();
const del = require('del');
const wiredep = require('wiredep').stream;
const runSequence = require('run-sequence');
const fs = require("fs");
const plato = require('es6-plato');

const $ = gulpLoadPlugins();
const reload = browserSync.reload;

var dev = true;

function getFiles (dir, files_){
    files_ = files_ || [];
    var files = fs.readdirSync(dir);
    for (var i in files){
        var name = dir + '/' + files[i];
        if (fs.statSync(name).isDirectory()){
            getFiles(name, files_);
        } else {
            files_.push(name);
        }
    }
    return files_;
}

gulp.task('plato', () => {
  let input = getFiles(__dirname+'/app/scripts/');
  let output = './artifacts/plato';
  let options = {
    'title': 'ScrumChartBoard',
    'recurse': true,
    'noempty': true,
    'eslint': {
      "ecmaVersion": 6,
      "sourceType": "module"
    }
  };
  function callback(reports){
    let overview = plato.getOverviewReport(reports);

    let {
      total,
      average
    } = overview.summary;

    let output = `total
      ----------------------
      eslint: ${total.eslint}
      sloc: ${total.sloc}
      maintainability: ${total.maintainability}
      average
      ----------------------
      eslint: ${average.eslint}
      sloc: ${average.sloc}
      maintainability: ${average.maintainability}`;

    console.log(output);
  }

  plato.inspect(input, output, options, callback);

});

gulp.task('styles', () => {
  return gulp.src('app/styles/*.less')
    .pipe($.plumber())
    .pipe($.sourcemaps.init())
    .pipe($.less({
      paths: ['.']
    }))
    .pipe($.autoprefixer({browsers: ['> 1%', 'last 2 versions', 'Firefox ESR']}))
    .pipe($.sourcemaps.write())
    .pipe(gulp.dest('.tmp/styles'))
    .pipe(reload({stream: true}));
});

gulp.task('scripts', () => {
  return gulp.src('app/scripts/**/*.js')
    .pipe($.plumber())
    .pipe($.sourcemaps.init())
    .pipe($.babel())
    .pipe($.sourcemaps.write('.'))
    .pipe(gulp.dest('.tmp/scripts'))
    .pipe(reload({stream: true}));
});

function lint(files, options) {
  return gulp.src(files)
    .pipe($.eslint({ fix: true }))
    .pipe(reload({stream: true, once: true}))
    .pipe($.eslint.format())
    .pipe($.if(!browserSync.active, $.eslint.failAfterError()));
}

gulp.task('lint', () => {
  return lint('app/scripts/**/*.js')
    .pipe(gulp.dest('app/scripts'));
});
gulp.task('lint:test', () => {
  return lint('test/spec/**/*.js')
    .pipe(gulp.dest('test/spec'));
});

gulp.task('html', ['styles', 'templates', 'scripts'], () => {
  return gulp.src('app/*.html')
    .pipe($.useref({searchPath: ['.tmp', 'app', '.']}))
    .pipe($.if('*.js', $.uglify()))
    .pipe($.if('*.css', $.cssnano({safe: true, autoprefixer: false})))
    .pipe($.if('*.html', $.htmlmin({collapseWhitespace: true})))
    .pipe(gulp.dest('dist'));
});

gulp.task('images', () => {
  return gulp.src('app/images/**/*')
    .pipe($.cache($.imagemin()))
    .pipe(gulp.dest('dist/images'));
});

gulp.task('fonts', () => {
  return gulp.src(require('main-bower-files')('**/*.{eot,svg,ttf,woff,woff2}', function (err) {})
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

gulp.task('templates', () => {
  return gulp.src('app/templates/**/*.hbs')
    .pipe($.handlebars())
    .pipe($.defineModule('plain'))
    .pipe($.declare({
      namespace: 'App.templates'
    }))
    .pipe(gulp.dest('.tmp/templates'));
});

gulp.task('extras', () => {
  return gulp.src([
    'app/*',
    '!app/*.html'
  ], {
    dot: true
  }).pipe(gulp.dest('dist'));
});

gulp.task('clean', del.bind(null, ['.tmp', 'dist']));

gulp.task('serve', () => {
  runSequence(['clean', 'wiredep'], ['styles', 'templates', 'scripts', 'fonts', 'mockData', 'sampleData'], () => {
    browserSync.init({
      notify: false,
      port: 9000,
      server: {
        baseDir: ['.tmp', 'app'],
        routes: {
          '/bower_components': 'bower_components'
        }
      }
    });

    gulp.watch([
      'app/*.html',
      'app/templates/**/*.hbs',
      'app/images/**/*',
      '.tmp/fonts/**/*'
    ]).on('change', reload);

    gulp.watch('app/styles/**/*.less', ['styles']);
    gulp.watch('app/scripts/**/*.js', ['scripts']);
    gulp.watch('app/fonts/**/*', ['fonts']);
    gulp.watch('app/templates/**/*.hbs', ['templates']);
    gulp.watch('bower.json', ['wiredep', 'fonts']);
  });
});

gulp.task('serve:dist', ['default'], () => {
  browserSync.init({
    notify: false,
    port: 9000,
    server: {
      baseDir: ['dist']
    }
  });
});

gulp.task('serve:test', ['scripts', 'templates'], () => {
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

  gulp.watch([
    'test/index.html',
    'app/scripts/**/*.js',
    'app/templates/**/*.hbs',
    'test/spec/**/*.js'
  ]).on('finish', function(e){
    reload();
  });

  gulp.watch('app/scripts/**/*.js', ['scripts']);
  gulp.watch('app/templates/**/*.hbs', ['templates']);
  gulp.watch('test/spec/**/*.js', ['lint:test']);

});

// inject bower components
gulp.task('wiredep', () => {
  gulp.src('app/styles/*.less')
    .pipe($.filter(file => file.stat && file.stat.size))
    .pipe(wiredep({
      ignorePath: /^(\.\.\/)+/
    }))
    .pipe(gulp.dest('app/styles'));

  gulp.src('app/*.html')
    .pipe(wiredep({
      ignorePath: /^(\.\.\/)*\.\./
    }))
    .pipe(gulp.dest('app'));
});

gulp.task('build', ['lint', 'html', 'images', 'fonts', 'extras'], () => {
  return gulp.src('dist/**/*').pipe($.size({title: 'build', gzip: true}));
});

gulp.task('stats', ['plato']);

gulp.task('default', () => {
  return new Promise(resolve => {
    dev = false;
    runSequence(['clean', 'wiredep'], 'build', resolve);
  });
});
