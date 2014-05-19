var gulp = require('gulp'),
    gutil = require('gulp-util'),
    jade = require('gulp-jade'),
    sass = require('gulp-sass'),
    cssmin = require('gulp-cssmin'),
    clean = require('gulp-clean'),
    path = require('path'),
    tinylr = require('tiny-lr'),
    http = require('http'),
    ecstatic = require('ecstatic'),
    embedlr = require("gulp-embedlr"),
    exec = require('child_process').exec,
    rename = require("gulp-rename"),
    tree = require('gulp-tree'),
    scriptInject = require('gulp-script-inject'),
    prunehtml = require('gulp-prune-html'),
    autoprefixer = require('gulp-autoprefixer'),
    wiredep = require('wiredep').stream;

console.log()

var tlr = tinylr()
var livereload = function (evt, filepath) {

    tlr.changed({
        body: {
            files: path.relative('./src', filepath)
        }
    });
}

/**
 * Sass Task
 */
gulp.task('sass', function(){

    gulp.src(['./src/assets/sass/**/*.scss', '!./src/**/_*'])
        .pipe(sass({
            sourcemap: true
        }))
        .pipe(gulp.dest('./src/assets/css'))

})

gulp.task('sassApp', function(){
	gulp.src(['./src/external/scss/**/*.scss', '!./src/external/**/_*'])
	    .pipe(sass({
	        sourcemap: true
	    }))
	    .pipe(autoprefixer('last 2 version', 'ie 8', 'ie 9'))
	    .pipe(gulp.dest('./src/external/css'))
})


gulp.task('tree', function(){

    gulp.src('./src/patterns')
        .pipe(tree({
            path: './src/json/'
        }))
        .pipe(gulp.dest('./src/json'))
})


gulp.task('injecter', ['jade', 'tree'], function(){

    gulp.src('./src/index.html')
        .pipe(prunehtml(['#jsonPath']))
        .pipe(scriptInject({
            json: './src/json',
            varname: 'jsonPath'
        }))
        .pipe(gulp.dest('./src'))
})

gulp.task('bower', function() {
	gulp.src('./src/jade/layouts/_patterns.jade')
		.pipe(wiredep({
			directory: './src/bower_components',
			bowerJson: require('./bower.json'),
			exclude: [ 'jquery.js', 'modernizr.js' ],
			filetypes: {
				jade: {
					block: /(([ \t]*)\/\/\s*bower:*(\S*))(\n|\r|.)*?(\/\/\s*endbower)/gi,
					detect: {
						js: /script\(.*src=['"](.+)['"]>/gi,
						css: /link\(href=['"](.+)['"]/gi
					},
					replace: {
						js: 'script(src=\'{{filePath}}\')',
						css: 'link(rel=\'stylesheet\', href=\'{{filePath}}\')'
					}
				}
			}
		}))
		.pipe(gulp.dest('./src/jade/layouts'))
})

/**
 * Jade
 */

gulp.task('jade', function(){

    return gulp.src(['./src/jade/**/*.jade', '!**/_*', '!src/jade/patterns/', '!src/jade/patterns/**'])
        .pipe(jade({
            pretty : true
        }))
        .pipe(embedlr())
        .pipe(gulp.dest('./src/'))
    ;

})

gulp.task('patternsJade', function(){

    return gulp.src('./src/jade/patterns/**/*.jade')
        .pipe(jade({
            pretty: true
        }))
        .pipe(rename(function(path){
            path.extname = ".md"
        }))
        .pipe(gulp.dest('./src/patterns'))
})



/**
 * Jade task to compile templates
 */

gulp.task('ngtemplatesJade', function(){

    gulp.src(['./src/assets/js/templates/jade/*.jade'])
        .pipe(jade({
            pretty: true
        }))
        .pipe(gulp.dest('./src/assets/js/templates'))


})

/**
 * Clean scripts
 */


gulp.task('cleaner', function(){

    return gulp.src('./build', {read:false})
        .pipe(clean({force: true}))
})

gulp.task('cleanJSON', function(){

    return gulp.src('./src/json/*.json', {read: false})
        .pipe(clean())
})

/**
 * Watch
 */

gulp.task('watch', function(){

    gulp.watch(['src/jade/**/*.jade'], ['jade', 'injecter']);
    gulp.watch('src/assets/sass/**/*.scss', ['sass']);

    /* Jade patterns */

    gulp.watch('src/assets/js/templates/**/*.jade', ['ngtemplatesJade']);

    gulp.watch('src/jade/patterns/**', ['patternsJade'])

    gulp.watch('src/patterns/**/*', ['injecter'])

    /* Project Specific */
     gulp.watch('src/external/scss/**/*.scss', ['sassApp']);
     gulp.watch('bower.json', ['bower']);


})


/**
 * Copy
 */

gulp.task('copy', ['cleaner'], function(){

    gulp.src(['./src/**', '!./src/jade'])
        //.pipe(cssmin())
        .pipe(gulp.dest('./build'))

})



/**
 * Create servers
 */


gulp.task('server', function(){

    http.createServer(ecstatic({root: './src'})).listen(8000);

    gutil.log(gutil.colors.blue('HTTP server listening on port 8000'));

    tlr.listen(35729);

    gutil.log(gutil.colors.blue('Livereload server listening on port 35729'));

    /* Add a watcher */

    gulp.watch(['./src/assets/css/*', './src/*.html', './src/external/css/*'])._watcher.on('all', livereload)
})


/**
 * Main tasks : Default and Build
 */

gulp.task('build', ['sass', 'jade', 'copy'])
gulp.task('patterns', ['cleanJSON', 'injecter', 'sass', 'sassApp', 'watch', 'server']);
