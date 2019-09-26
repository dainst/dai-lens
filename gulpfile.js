const { src, dest, series, task } = require('gulp');
const uglify = require('gulp-uglify');
const rename = require('gulp-rename');
const babel = require('gulp-babel');
var sass = require('gulp-sass');
sass.compiler = require('node-sass');
var through2 = require('through2');
var browserify = require('browserify');
var concat = require('gulp-concat');
const { rollup } = require('rollup');

function assets(cb) {
  src('assets/**/*', {base:"./assets"})
    .pipe(dest('./dist'));
  src('data/**/*', {base:"."})
    .pipe(dest('./dist'));
  cb()
}

function styles(cb) {
  return src('./lens.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(rename('lens.css'))
    .pipe(dest('./dist'));
};



function buildjs(cb){
  return src('./boot.js')
    .pipe(babel({
        presets: ['@babel/env']
    }))
    .pipe(through2.obj(function (file, enc, next) {
      console.log('browserify')
        browserify(file.path)
            .bundle(function (err, res) {
                if (err) { 
                  console.log('error here')
                  return next(err); 
                }
                file.contents = res;
                next(null, file);
            });
    }))
    .on('error', function (error) {
        console.log('aaaaaaaa', error)
        console.log(error.stack);
        this.emit('end');
    })
    .pipe(rename('lens.js'))
    .pipe(uglify())
    .pipe(dest('./dist'));
}

function build(cb) {
  src('./boot.js')
    .pipe(babel({
        presets: ['@babel/env']
    }))
    // The gulp-uglify plugin won't update the filename
    .pipe(uglify())
    // So use gulp-rename to change the extension
    .pipe(rename('lens.js'))
    .pipe(dest('./dist'));
  cb()
}
var paths = {
  scripts: {
    src: 'src/**/*.js',
    dest: './dist'
  }
};


function scripts() {
  return src('./boot.js')
    .pipe(babel({
      presets: ['@babel/env']
    }))
    .pipe(uglify())
    .pipe(concat('lens.js'))
    .pipe(dest(paths.scripts.dest));
}


// Rollup's promise API works great in an `async` task
async function build_js() {
  const bundle = await rollup({
    input: './boot.js'
  });

  return bundle.write({
    file: 'dist/lens.js',
    format: 'iife'
  });
}

exports.default = series(assets, styles, build_js);