module.exports = function(grunt) {
  // Project configuration
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concat: {
      options: { separator: ';' },
      dist: {
        src: ['scripts/*.js'],
        dest: 'dist/<%= pjg.name %>.js
      }
    }
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      build: {
        src: 'scripts/<%= pkg.name %>.js',
        dest: 'build/<%= pkg.name %>.min.js',
      }
    }
    jshint: {
      files: ["Gruntfile.js", "script/*.js"],
      options: {
        globals: {
          jQuert: true,
          console: true,
          module: true
        }
      }
    }
    watch: {
      files: ['<%= jshint.files %>'],
      tasks: ['jshint', 'quint']
    }
  });
  
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-qunit');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNomTasks('grunt-contrib-concat');

  grunt.registerTask('test', ['jshint', 'quint']);
  grunt.registerTask('default', ['jshint', 'quint', 'concat', 'uglify']);
};

