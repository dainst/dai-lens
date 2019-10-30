const { src, dest, series } = require('gulp');
const uglify = require('gulp-uglify');
const rename = require('gulp-rename');
var sass = require('gulp-sass');
// sass.compiler = require('node-sass');
var through2 = require('through2');
var browserify = require('browserify');
var babelify    = require('babelify');

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
    .pipe(through2.obj(function (file, enc, next) {
        browserify({
              entries: './boot.js',
              debug: true,
              transform: [babelify.configure({
                presets: ['@babel/env']
              })]
            })
            .bundle(function (err, res) {
                if (err) { 
                  return next(err); 
                }
                file.contents = res;
                next(null, file);
            });
    }))
    .on('error', function (error) {
        console.log(error, error.stack);
        this.emit('end');
    })
    .pipe(rename('lens.js'))
    .pipe(uglify())
    .pipe(dest('./dist'));
}

exports.default = series(assets, styles, buildjs);
