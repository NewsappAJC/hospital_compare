module.exports = function(grunt) {
  // Project configuration
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    aws: grunt.file.readJSON('config/aws.json'),
    copy: {
      target: {
        files: [
          { expand: true, flatten: true, src: ['src/scripts/lib/*.js'], dest: 'build/scripts/lib/' },
          { expand: true, flatten: true, src: ['src/data/*'], dest: 'build/data/' },
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
          _: true
        }
      }
    },
    uglify: {
      options: {
        // mangle: { except: ['d3', '_','$'] },
        mangle: false,
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
          'build/index.html'    : 'src/index.html',
          'build/hospitals.html': 'src/hospitals.html'
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
        { src: 'build/hospitals.html', dest: '.' },
        { src: 'build/scripts/hospitals.js', dest: 'scripts/' },
        { src: 'build/scripts/lib/*', dest: 'scripts/lib/' },
        { src: 'build/data/detail.csv', dest: 'data/' },
        { src: 'build/data/statement.csv', dest: 'data/' },
        { src: 'build/data/source_text.csv', dest: 'data/' },
        { src: 'build/style/*', dest: 'style/' },
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

