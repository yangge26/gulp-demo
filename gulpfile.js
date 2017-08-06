var gulp = require('gulp'),
    uglify = require('gulp-uglify'),
    concat = require('gulp-concat'),
    rename = require('gulp-rename'),
    livereload = require('gulp-livereload'),
    less = require('gulp-less'),
    clean = require('gulp-clean'),
    header = require('gulp-header'),
    minifycss = require('gulp-minify-css'),
    dateFormat = require('dateformat'),
    useref = require('gulp-useref'),
    rev = require('gulp-rev'),
    filter = require('gulp-filter'),
    revReplace = require('gulp-rev-replace'),
    runSequence = require('run-sequence'),
    htmlmin = require('gulp-htmlmin'),
    gulpSequence=require('gulp-sequence'),
    sourcemaps = require('gulp-sourcemaps');

var nowTime = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss");
var pkg = require('./package.json');


//gulp默认任务
gulp.task('default', function() {
    gulp.src('js/*.js')
        .pipe(uglify())
        .pipe(concat('all.min.js'))
        .pipe(gulp.dest('build'));
});
//重命名
gulp.task('rename', function() {
    gulp.src('js/some.js')
        .pipe(uglify())
        .pipe(rename('some.min.js'))
        .pipe(gulp.dest('build'));
});
//js目录下的js文件，有变化执行任务
gulp.task('watch', function() {
    livereload.listen();
    gulp.watch('js/*.js', ['default']);
});
//将less目录下的less文件转成css
gulp.task('less', function() {
    gulp.src('less/*.less')
        .pipe(less())
        .pipe(gulp.dest('build/css'));
});
//压缩css文件，并加上注释
gulp.task('mincss', function() {
    gulp.src('css/*.css')
        .pipe(minifycss())
        .pipe(header('/* <%= pkg.name %>-v<%= pkg.version %> <%= nowTime %>*/', { pkg: pkg, nowTime: nowTime }))
        .pipe(gulp.dest('build'));
});
//将test目录下的js文件全部删除
gulp.task('clean', function() {
    gulp.src('build/*.js', { read: false })
        .pipe(clean());
});
//将test目录下的js文件和css文件全部删除，目录写法支持数组写法
gulp.task('clean1', function() {
    gulp.src(['build/*.js', 'build/*.css'], { read: false })
        .pipe(clean());
});
//将test目录下的js文件和css文件全部删除，支持大括号选择多种文件格式
gulp.task('clean2', function() {
    gulp.src('build/*.{js,css}', { read: false })
        .pipe(clean());
});
//配合html文件中注释格式，将制定文件进行合并
gulp.task('usereftest', function() {
    gulp.src('test/test.html')
        .pipe(useref()).pipe(gulp.dest('build'));
});
//将test目录下的html文件进行md5命名
gulp.task('revtest', function() {
    gulp.src('test/*.html')
        .pipe(rev()).pipe(gulp.dest('build'));
});
//过滤文件
gulp.task('filtertest', function() {
    var f = filter("test/test.html");
    gulp.src('test/*.html')
        .pipe(f).pipe(gulp.dest('build'));
});
//更新html中的文件引用
gulp.task('revhtml', function() {
    var jsFilter = filter("**/*.js", { restore: true });
    var cssFilter = filter("**/*.css", { restore: true });
    return gulp.src('test/*.html')
        .pipe(useref())
        .pipe(cssFilter)
        .pipe(minifycss())
        .pipe(rev())
        .pipe(cssFilter.restore)
        .pipe(jsFilter)
        .pipe(uglify())
        .pipe(rev())
        .pipe(jsFilter.restore)
        .pipe(revReplace())
        .pipe(gulp.dest('build'));
});

gulp.task('htmlmin', function() {
    return gulp.src("test/*.html")
            .pipe(htmlmin({collapseWhitespace:true,minifyJS:true,minifyCSS:true}))
            .pipe(gulp.dest('build'));
});

//将test目录下的js文件全部删除
gulp.task('distclean', function() {
    return gulp.src('build/**', { read: false })
        .pipe(clean());
});

gulp.task('runtest', function() {
    runSequence('distclean','revhtml','htmlmin');
});

//执行多个任务
gulp.task("all", ["rename", "default"]);
