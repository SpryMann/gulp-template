const { src, dest, watch, series, parallel } = require("gulp");
const pug = require("gulp-pug");
const prettify = require("gulp-prettify");
const sass = require("gulp-sass")(require("sass"));
const gcmq = require("gulp-group-css-media-queries");
const autoprefixer = require("gulp-autoprefixer");
const imagemin = require("gulp-imagemin");
const browsersync = require("browser-sync").create();
const del = require("del");

const pugTask = () => {
  return src(["./src/pug/index.pug", "./src/pug/pages/**/*.pug"])
    .pipe(pug())
    .pipe(prettify())
    .pipe(dest("./dist"));
};

const scssTask = () => {
  return src("./src/scss/**/*.scss")
    .pipe(sass({ sourceMap: true }).on("error", sass.logError))
    .pipe(gcmq())
    .pipe(autoprefixer())
    .pipe(dest("./dist/css"))
    .pipe(browsersync.stream());
};

const jsTask = () => {
  return src("./src/js/**/*.js")
    .pipe(dest("./dist/js"))
    .pipe(browsersync.stream());
};

const imagesTask = () => {
  return src("./src/images/*.*").pipe(imagemin()).pipe(dest("./dist/images"));
};

const serve = (cb) => {
  browsersync.init({
    server: {
      baseDir: "./dist",
    },
    notify: true,
  });

  watch("./src/**/*.pug", pugTask).on("change", browsersync.reload);
  watch("./src/**/*.scss", scssTask);
  watch("./src/**/*.js", jsTask);

  cb();
};

const clean = (cb) => {
  return del("./dist");
};

exports.pugTask = pugTask;
exports.scssTask = scssTask;
exports.jsTask = jsTask;
exports.imagesTask = imagesTask;
exports.serve = serve;
exports.clean = clean;
exports.build = series(clean, parallel(pugTask, scssTask, jsTask));
exports.default = series(
  clean,
  imagesTask,
  parallel(pugTask, scssTask, jsTask),
  serve
);
