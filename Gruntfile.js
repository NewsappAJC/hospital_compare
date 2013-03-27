module.exports = function(grunt) {
  // Project configuration
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    aws: grunt.file.readJSON('config/aws.json')
    copy: {
      target: {
        files: [
          { expand: true, flatten: true, src: ['src/scripts/lib/*.js'], dest: 'build/scripts/lib/' }
        ]
      }
    },
    jshint: {
      all: [
        'Grintfile.js',
        'src/scripts/*.js'
      ],
      options: {
        browser: true,
        globals: {
          JQuery: true,
          $: true
        }
      }
    },
    uglify: {
      options: {
        mangle: { except: ['d3'] },
        compress: true
      },
      my_target: {
        files: {
          'build/scripts/states.js'   : ['src/scripts/states.js'],
          'build/scripts/hospitals.js': ['src/scripts/hospitals.js'],
          'build/scripts/detail.js'   : ['src/scripts/detail.js']
        }
      }
    },
    htmlmin: {
      build: {
        options: {
          removeComments: true,
          collapsWhitespace: true,
          useShortDoctype: true
        },
        files: {
          'build/index.html': 'src/index.html',
          'build/hospitals.html': 'src/hospitals.html',
          'build/detail.html': 'src/detail.html'
        }
      }
    }
  });
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-htmlmin');
  grunt.loadNpmTasks('grunt-s3');

  grunt.registerTask('default', ['copy','uglify','htmlmin']);
};

