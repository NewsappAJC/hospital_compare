module.exports = function(grunt) {
  // Project configuration
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    aws: grunt.file.readJSON('config/aws.json'),
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
        curly: true,
        eqeqeq: true,
        latedef: true,
        quotmark: true,
        undef: true,
        unused: true,
        strict: true,
        trailing: true,
        smarttabs: true,
        indent: 2,
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
    },
    cssmin: {
      compress: {
        options: {
          report: 'gzip'
        },
        files: {
          'build/style/app.css': ['src/style/*.css']
        }
      }
    }
  });
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-htmlmin');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-s3');

  grunt.registerTask('default', ['copy','uglify','htmlmin','cssmin']);
};

