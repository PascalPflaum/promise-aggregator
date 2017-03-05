module.exports = function (grunt) {

    grunt.loadNpmTasks('grunt-eslint');
    grunt.loadNpmTasks('grunt-mocha-test');

    grunt.initConfig({

        mochaTest: {
            build: {
                src: ['test/unit/**/*.js'],
                options: {
                    reporter: 'spec',
                    checkLeaks: true,
                    ignoreLeaks: false,
                    require: ['test/setup.js', 'babel-register'],
                },
            },
        },
        eslint: {
            options: {
                fix: true,
            },
            'human': {
                src: ['Gruntfile.js', 'src', 'test'],
            },
        },
    });

    // QA
    grunt.registerTask('unit', ['mochaTest:build']);
    grunt.registerTask('hint', ['eslint']);
    grunt.registerTask('test', ['unit']);

    // default
    grunt.registerTask('default', ['hint', 'test']);
};
