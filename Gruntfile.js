// Generated on 2015-01-31 using generator-chromeapp 0.2.14
'use strict';

var browserify = require('browserify');
var concat = require('concat-stream');

// # Globbing
// for performance reasons we're only matching one level down:
// 'test/spec/{,*/}*.js'
// use this if you want to recursively match all subfolders:
// 'test/spec/**/*.js'

module.exports = function(grunt) {

    var ALL_JS = [
        'Gruntfile.js',
        '<%= config.app %>/js/{,*/}*.js',
        '!<%= config.app %>/js/vendor/*',
        'test/spec/{,*/}*.js'
    ];

    // Load grunt tasks automatically
    require('load-grunt-tasks')(grunt);

    // Time how long tasks take. Can help when optimizing build times
    require('time-grunt')(grunt);

    // Configurable paths
    var config = {
        app: 'app',
        dist: 'dist',
        tasks: grunt.cli.tasks
    };

    // Define the configuration for all the tasks
    grunt.initConfig({

        // Project settings
        config: config,

        // Watches files for changes and runs tasks based on the changed files
        watch: {
            bower: {
                files: ['bower.json'],
                tasks: ['bowerInstall']
            },
            js: {
                files: ['<%= config.app %>/js/{,*/}*.js'],
                tasks: ['jshint'],
                options: {
                    livereload: true
                }
            },
            gruntfile: {
                files: ['Gruntfile.js']
            },
            styles: {
                files: ['<%= config.app %>/css/{,*/}*.css'],
                tasks: [],
                options: {
                    livereload: true
                }
            },
            livereload: {
                options: {
                    livereload: '<%= connect.options.livereload %>'
                },
                files: [
                    '.tmp/css/{,*/}*.css',
                    '<%= config.app %>/*.html',
                    '<%= config.app %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}',
                    '<%= config.app %>/manifest.json',
                    '<%= config.app %>/_locales/{,*/}*.json'
                ]
            }
        },

        // Empties folders to start fresh
        clean: {
            server: '.tmp',
            chrome: '.tmp',
            dist: {
                files: [{
                    dot: true,
                    src: [
                        '.tmp',
                        '<%= config.dist %>/*',
                        '!<%= config.dist %>/.git*'
                    ]
                }]
            }
        },

        jsbeautifier: {
            options: {
                jsbeautifyrc: 'node_modules/tradle-style/.jsbeautifyrc'
            },
            default: {
                src: ALL_JS,
            }
        },

        // Make sure code styles are up to par and there are no obvious mistakes
        jshint: {
            options: {
                jshintrc: '.jshintrc',
                reporter: require('jshint-stylish')
            },
            all: ALL_JS
        },

        // browserify: {
        //   dist: {
        //     options: {
        //       debug: true,
        //       ignore: ['<%= config.app %>/js/chromereload.js']
        //     },
        //     src: ['<%= config.app %>/js/**/*.js'],
        //     dest: 'build/bundle.js'
        //   }
        // },

        // Mocha testing framework configuration options
        mocha: {
            all: {
                options: {
                    run: true,
                    urls: ['http://localhost:<%= connect.options.port %>/index.html']
                }
            }
        },

        // Automatically inject Bower components into the HTML file
        bowerInstall: {
            app: {
                src: ['<%= config.app %>/index.html'],
                ignorePath: '<%= config.app %>/'
            }
        },

        // Copies remaining files to places other tasks can use
        copy: {
            dist: {
                files: [{
                    expand: true,
                    dot: true,
                    cwd: '<%= config.app %>',
                    dest: '<%= config.dist %>',
                    src: [
                        '*.{ico,png,txt}',
                        'images/{,*/}*.{webp,gif,png}',
                        '{,*/}*.html',
                        'fonts/{,*/}*.*',
                        '_locales/{,*/}*.json',
                        'js/background.js',
                        'css/*.css'
                    ]
                }]
            },

            vendorStyles: {
              files: [{
                expand: true,
                dest: '<%= config.dist %>/',
                src: [
                  'node_modules/bootstrap/dist/**/*.min.css',
                  'node_modules/bootstrap/dist/fonts/**',
                  'node_modules/angular/angular-csp.css'
                ]
              }]
            }
            // ,
            // styles: {
            //     expand: true,
            //     dot: true,
            //     cwd: '<%= config.app %>/styles',
            //     dest: '.tmp/styles/',
            //     src: ['{,*/}*.css', 'node_modules/bootstrap/dist/css/*.min.css']
            // }
        },

        // concat: {
        //   options: {
        //     cwd: '<%= config.app %>/'
        //   },
        //   vendorCSS: {
        //     dest: '<%= config.dist %>/css/vendor.css',
        //     src: [
        //       'node_modules/bootstrap/dist/css/*.min.css',
        //       'node_modules/angular/angular-csp.css'
        //     ]
        //   },
        //   css: {
        //     files: [{
        //       expand: true,
        //       flatten: true,
        //       dot: true,
        //       dest: '<%= config.dist %>/css/app.css',
        //       src: ['css/*.css']
        //     }]
        //   }
        // },

        // Run some tasks in parallel to speed up build process
        // concurrent: {
        //     server: [
        //         'copy:styles'
        //     ],
        //     chrome: [
        //         'copy:styles'
        //     ],
        //     dist: [
        //         'copy:styles'
        //     ],
        //     test: [
        //         'copy:styles'
        //     ],
        // },

        // Merge event page, update build number, exclude the debug script
        chromeManifest: {
            dist: {
                options: {
                    buildnumber: true,
                    background: {
                        target: 'js/background.js',
                        exclude: [
                            'js/chromereload.js'
                        ]
                    }
                },
                src: '<%= config.app %>',
                dest: '<%= config.dist %>'
            }
        },

        // Compress files in dist to make Chromea Apps package
        compress: {
            dist: {
                options: {
                    archive: function() {
                        var manifest = grunt.file.readJSON('app/manifest.json');
                        return 'package/chromesign-' + manifest.version + '.zip';
                    }
                },
                files: [{
                    expand: true,
                    cwd: 'dist/',
                    src: ['**'],
                    dest: ''
                }]
            }
        }
    });

    grunt.registerTask('debug', function(platform) {
        var watch = grunt.config('watch');
        platform = platform || 'chrome';

        // Configure style task for debug:server task
        if (platform === 'server') {
            watch.styles.tasks = ['newer:copy:styles'];
            watch.styles.options.livereload = false;

        }

        // Configure updated watch task
        grunt.config('watch', watch);

        grunt.task.run([
            'clean:' + platform,
            'concurrent:' + platform,
            'connect:' + platform,
            'watch'
        ]);
    });

    grunt.registerTask('browserify', function() {
      var done = this.async();
      // var togo = 2;
      var bundle = browserify()
        .add('./app/js/app.js')
        .bundle()
        .pipe(concat(function(buf) {
          grunt.file.write('dist/js/bundle.js', buf.toString());
          done();
        }));

      // var bundle2 = browserify()
      //   .add('./app/js/index.js')
      //   .bundle()
      //   .pipe(concat(function(buf) {
      //     grunt.file.write('dist/js/bundle.js', buf.toString());
      //     finish();
      //   }));

      //   function finish() {
      //     if (--togo === 0) done();     
      //   }
    });

    grunt.registerTask('test', [
        'connect:test',
        'mocha'
    ]);

    grunt.registerTask('build', [
        'clean:dist',
        'chromeManifest:dist',
        // 'useminPrepare',
        // 'concurrent:dist',
        // 'concat',
        // 'cssmin',
        // 'uglify',
        'concat',
        'copy',
        // 'usemin',
        // 'htmlmin',
        'browserify',
        'compress'
    ]);

    grunt.registerTask('default', [
        'newer:jshint',
        'test',
        'build'
    ]);
};
