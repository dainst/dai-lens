const { src, dest, series, task } = require('gulp');
// const uglify = require('gulp-uglify');
const rename = require('gulp-rename');
// const babel = require('gulp-babel');
var sass = require('gulp-sass');
// sass.compiler = require('node-sass');
// var through2 = require('through2');
// var browserify = require('browserify');
// var concat = require('gulp-concat');
// const { rollup } = require('rollup');

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



// function buildjs(cb){
//   return src('./boot.js')
//     .pipe(babel({
//         presets: ['@babel/env']
//     }))
//     .pipe(through2.obj(function (file, enc, next) {
//       console.log('browserify')
//         browserify(file.path)
//             .bundle(function (err, res) {
//                 if (err) { 
//                   console.log('error here')
//                   return next(err); 
//                 }
//                 file.contents = res;
//                 next(null, file);
//             });
//     }))
//     .on('error', function (error) {
//         console.log('aaaaaaaa', error)
//         console.log(error.stack);
//         this.emit('end');
//     })
//     .pipe(rename('lens.js'))
//     .pipe(uglify())
//     .pipe(dest('./dist'));
// }

// function build(cb) {
//   src('./boot.js')
//     .pipe(babel({
//         presets: ['@babel/env']
//     }))
//     // The gulp-uglify plugin won't update the filename
//     .pipe(uglify())
//     // So use gulp-rename to change the extension
//     .pipe(rename('lens.js'))
//     .pipe(dest('./dist'));
//   cb()
// }


// function scripts() {
//   return src('./boot.js')
//     .pipe(babel({
//       presets: ['@babel/env']
//     }))
//     .pipe(uglify())
//     .pipe(concat('lens.js'))
//     .pipe(dest('./dist'));
// }




// // Rollup's promise API works great in an `async` task
// async function build_js() {
//   const bundle = await rollup({
//     input: './boot.js'
//   });

//   return bundle.write({
//     file: 'dist/lens.js',
//     format: 'iife'
//   });
// }


// var babelify = require('babelify');
// var source = require('vinyl-source-stream');
// var buffer = require('vinyl-buffer');
// var sourcemaps = require('gulp-sourcemaps');
// var util = require('gulp-util');
// var sourceFile = './boot.js',
//     destFolder = './dist',
//     destFile = 'lens.js';
// function browse() {
//   var b = browserify({
//     entries: './boot.js',
//     debug: true,
//     transform: [babelify.configure({
//       presets: ['@babel/env']
//     })]
//   });

//   return b.bundle()
//     .pipe(source('./boot.js'))
//     .pipe(buffer())
//     .pipe(sourcemaps.init({ loadMaps: true }))
//       // Add other gulp transformations (eg. uglify) to the pipeline here.
//       .on('error', util.log)
//     .pipe(sourcemaps.write('./'))
//     .pipe(dest('./dist'));
// };

// function testjs() {
//   var bundler = browserify({
//     entries: sourceFile,
//     cache: {}, packageCache: {}, fullPaths: true, debug: true
//   });

//   var bundle = function() {
//     return bundler
//       .bundle()
//       .on('error', function () {})
//       .pipe(source(destFile))
//       .pipe(dest(destFolder));
//   };

//   return bundle()
// }
// exports.default = series(assets, styles, testjs);



var gulp        = require('gulp');
var browserify  = require('browserify');
var babelify    = require('babelify');
var source      = require('vinyl-source-stream');
var buffer      = require('vinyl-buffer');
var uglify      = require('gulp-uglify');
var sourcemaps  = require('gulp-sourcemaps');
 
function build() {
    return browserify({entries: './boot.js', debug: true})
        .transform("babelify", { presets: ['@babel/env'] })
        .bundle()
        .pipe(source('lens.js'))
        .pipe(buffer())
        .pipe(sourcemaps.init())
        .pipe(uglify())
        .pipe(sourcemaps.write('./maps'))
        .pipe(dest('./dist'));
};
 

 
exports.default = series(assets, styles, build);