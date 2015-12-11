var gulp = require('gulp'),
    wiredep = require('wiredep').stream,
    eventStream = require('event-stream'),
    gulpLoadPlugins = require('gulp-load-plugins'),
    map = require('vinyl-map'),
    fs = require('fs'),
    path = require('path'),
    url = require('url'),
    uri = require('urijs'),
    urljoin = require('url-join'),
    s = require('underscore.string'),
    stringifyObject = require('stringify-object'),
    hawtio = require('hawtio-node-backend');

var plugins = gulpLoadPlugins({});
var pkg = require('./package.json');

var config = {
  main: '.',
  ts: ['plugins/**/*.ts'],
  privateTs: ['private/**/*.ts'],
  less: ['plugins/**/*.less'],
  privateLess: ['private/**/*.less'],
  templates: ['plugins/**/*.html'],
  privateTemplates: ['private/**/*.html'],
  templateModule: pkg.name + '-templates',
  privateTemplateModule: pkg.name + '-private-templates',
  dist: './dist/',
  js: pkg.name + '.js',
  privateJs: pkg.name + '-private.js',
  css: pkg.name + '.css',
  privateCss: pkg.name + '-private.css',
  tsProject: plugins.typescript.createProject({
    target: 'ES5',
    module: 'commonjs',
    declarationFiles: true,
    noExternalResolve: false
  }),
  privateTsProject: plugins.typescript.createProject({
    target: 'ES5',
    module: 'commonjs',
    declarationFiles: false,
    noExternalResolve: false
  })
};

gulp.task('wire-index.html', function() {
  return gulp.src('index.html')
    .pipe(wiredep({}))
    .pipe(gulp.dest('.'));
});

gulp.task('wire-karma.conf.js', function() {
  return gulp.src('karma.conf.js')
    .pipe(wiredep({}))
    .pipe(gulp.dest('.'));
});

gulp.task('bower', ['wire-index.html', 'wire-karma.conf.js']);

gulp.task('private-tsc', ['tsc'], function() {
  var tsResult = gulp.src(config.privateTs)
    .pipe(plugins.typescript(config.privateTsProject))
    .on('error', plugins.notify.onError({
      message: '<%= error.message %>',
      title: 'Typescript compilation error - test'
    }));

    return tsResult.js
        .pipe(plugins.concat('test-compiled.js'))
        .pipe(gulp.dest('.'));
});

gulp.task('private-template', ['private-tsc'], function() {
  return gulp.src(config.privateTemplates)
    .pipe(plugins.angularTemplatecache({
      filename: 'test-templates.js',
      root: 'test-plugins/',
      standalone: true,
      module: config.privateTemplateModule,
      templateFooter: '}]); hawtioPluginLoader.addModule("' + config.privateTemplateModule + '");'
    }))
    .pipe(gulp.dest('.'));
});

gulp.task('private-concat', ['private-template'], function() {
  return gulp.src(['test-compiled.js', 'test-templates.js'])
    .pipe(plugins.concat(config.privateJs))
    .pipe(gulp.dest(config.dist));
});

gulp.task('private-clean', ['private-concat'], function() {
  return gulp.src(['test-templates.js', 'test-compiled.js'], { read: false })
    .pipe(plugins.clean());
});

gulp.task('tsc', function() {
  var cwd = process.cwd();
  var tsResult = gulp.src(config.ts)
    .pipe(plugins.typescript(config.tsProject))
    .on('error', plugins.notify.onError({
      message: '<%= error.message %>',
      title: 'Typescript compilation error'
    }));

    return eventStream.merge(
      tsResult.js
        .pipe(plugins.concat('compiled.js'))
        .pipe(gulp.dest('.')),
      tsResult.dts
        .pipe(gulp.dest('d.ts')))
        .pipe(map(function(buf, filename) {
          if (!s.endsWith(filename, 'd.ts')) {
            return buf;
          }
          var relative = path.relative(cwd, filename);
          fs.appendFileSync('defs.d.ts', '/// <reference path="' + relative + '"/>\n');
          return buf;
        }));
});

gulp.task('less', function () {
  return gulp.src(config.less)
    .pipe(plugins.less({
      paths: [ path.join(__dirname, 'less', 'includes') ]
    }))
    .on('error', plugins.notify.onError({
      message: '<%= error.message %>',
      title: 'less file compilation error'
    }))
    .pipe(plugins.concat(config.css))
    .pipe(gulp.dest('./dist'));
});

gulp.task('private-less', function () {
  return gulp.src(config.privateLess)
    .pipe(plugins.less({
      paths: [ path.join(__dirname, 'less', 'includes') ]
    }))
    .on('error', plugins.notify.onError({
      message: '<%= error.message %>',
      title: 'private less file compilation error'
    }))
    .pipe(plugins.concat(config.privateCss))
    .pipe(gulp.dest('./dist'));
});


gulp.task('template', ['tsc'], function() {
  return gulp.src(config.templates)
    .pipe(plugins.angularTemplatecache({
      filename: 'templates.js',
      root: 'plugins/',
      standalone: true,
      module: config.templateModule,
      templateFooter: '}]); hawtioPluginLoader.addModule("' + config.templateModule + '");'
    }))
    .pipe(gulp.dest('.'));
});

gulp.task('concat', ['template'], function() {
  return gulp.src(['compiled.js', 'templates.js'])
    .pipe(plugins.concat(config.js))
    .pipe(gulp.dest(config.dist));
});

gulp.task('clean', ['concat'], function() {
  return gulp.src(['templates.js', 'compiled.js'], { read: false })
    .pipe(plugins.clean());
});

gulp.task('watch-less', function() {
  plugins.watch(config.less, function() {
    gulp.start('less');
  });
  plugins.watch(config.privateLess, function() {
    gulp.start('private-less');
  });
});

gulp.task('watch', ['build', 'build-private', 'watch-less'], function() {
  plugins.watch(['libs/**/*.d.ts', config.ts, config.templates], function() {
    gulp.start(['tsc', 'template', 'concat', 'clean']);
  });
  plugins.watch([config.privateTs, config.privateTemplates], function() {
    gulp.start([ 'private-template', 'private-concat', 'private-clean']);
  });
  plugins.watch(['libs/**/*.js', 'libs/**/*.css', 'index.html', urljoin(config.dist, '*')], function() {
    gulp.start('reload');
  });
});

gulp.task('connect', ['watch'], function() {
  plugins.connect.server({
    root: '.',
    livereload: true,
    port: 2772,
    fallback: 'index.html',
    middleware: function(connect, options) {
      return [
        function(req, res, next) {
          var path = req.originalUrl;
          // avoid returning these files, they should get pulled from js
          if (s.startsWith(path, '/plugins/')) {
            console.log("returning 404 for: ", path);
            res.statusCode = 404;
            res.end();
            return;
          } else {
            //console.log("allowing: ", path);
            next();
          }
        }];
    }
  });
});

gulp.task('reload', function() {
  gulp.src('.')
    .pipe(plugins.connect.reload());
});

gulp.task('build', ['bower', 'tsc', 'less', 'template', 'concat', 'clean']);

gulp.task('build-private', ['private-tsc', 'private-less', 'private-template', 'private-concat', 'private-clean']);

gulp.task('default', ['connect']);
