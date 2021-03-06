module.exports = function(grunt) {
  // Project configuration
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    aws: grunt.file.readJSON('config/aws.json'),
    copy: {
      target: {
        files: [
          { expand: true, flatten: true, src: ['src/scripts/lib/*.js'], dest: 'build/scripts/lib/' },
          { expand: true, flatten: true, src: ['src/data/*.csv'], dest: 'build/data/' },
          { expand: true, flatten: true, src: ['src/images/*'], dest: 'build/images/' }
        ]
      }
    },
    jshint: {
      files: [
        'Grintfile.js',
        'src/scripts/*.js'
      ],
      options: {
        browser: true,
        curly: true,
        eqeqeq: true,
        latedef: true,
        //quotmark: true,
        undef: true,
        unused: true,
        strict: true,
        trailing: true,
        smarttabs: true,
        indent: 2,
        globals: {
          JQuery: true,
          $: true,
          d3: true,
          _: true,
          Tabletop: true
        }
      }
    },
    uglify: {
      options: {
        mangle: { except: ['d3', '_','$'] },
        //mangle: false,
        compress: true,
        report: 'gzip'
      },
      my_target: {
        files: {
          'build/scripts/hospitals.js': ['src/scripts/hospitals.js']
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
          'build/index.html'    : 'src/index.html'
        }
      }
    },
    cssmin: {
      compress: {
        options: {
          report: 'gzip'
        },
        files: {
          'build/style/app.css': ['src/style/app.css'],
          'build/style/skeleton.css': ['src/style/skeleton.css']
        }
      }
    },
    s3: {
      key: "<%= aws.key %>",
      secret: "<%= aws.secret %>",
      bucket: "<%= aws.bucket %>",
      access: "public-read",
      gzip: false,
      debug: false,
      upload: [
        { src: 'build/index.html', dest: 'index.html' },
        { src: 'build/scripts/hospitals.js', dest: 'scripts/hospitals.js' },
        { src: 'build/scripts/lib/*', dest: 'scripts/lib/' },
        { src: 'build/data/*', dest: 'data/' },
        { src: 'build/style/*', dest: 'style/detail.csv' },
        { src: 'build/images/*', dest: 'images/' }
      ]
    }
  });
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-htmlmin');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-s3');

  grunt.registerTask('default', ['copy','uglify','htmlmin','cssmin','s3']);
};

