module.exports = function (grunt) {
    grunt.loadNpmTasks('grunt-typescript');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-qunit');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-open');
 
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        connect: {
            server: {
                options: {
                    port: 8080,
                    base: './'
                }
            }
        },
        typescript: {
            base: {
                src: ['ts/**/*.ts'],
                dest: 'js/canvasinput.js',
                options: {
                    module: 'commonjs',
                    target: 'es5',
                    sourceMap: true
                }
            }
        },
        uglify: {
            options: {
                mangle: false
            },
            my_target: {
                files: {
                    'js/canvasinput.min.js': ['js/canvasinput.js']
                }
            }
        },
        qunit: {
            all: ['test/**/*.html']
        },
        watch: {
            files: 'ts/**/*.ts',
            tasks: ['typescript','uglify']
        },
        open: {
            dev: {
                path: 'http://localhost:8080/index.html'
            }
        }
    });

    grunt.event.on('qunit.spawn', function (url) {
        grunt.log.ok("Running test: " + url);
    });

    grunt.registerTask('default', ['connect', 'open', 'watch']);
    grunt.registerTask('test', ['connect','qunit']);
 
}
