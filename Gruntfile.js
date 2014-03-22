module.exports = function (grunt) {

  grunt.initConfig({

    pkg: grunt.file.readJSON('package.json'),

    develop: {
      server: {
        file: 'app.js'
      }
    },

    regarde: {
      js: {
        files: [
          'app.js',
          'routes/*.js'
        ],
        tasks: ['develop', 'delayed-livereload']
      },
      css: {
        files: ['public/stylesheets/*.css'],
        tasks: ['livereload']
      },
      jade: {
        files: ['views/*.jade'],
        tasks: ['livereload']
      }
    },
    
    // grunt watch tasks
    watch: {
      styles: {
        files : 'public/stylesheets/*.less',
        tasks: ['less:dev'],
        options: {
          nospawn: true
        }
      }
    },

    // less compiling
    less: {
      dev: {
        options : {
          paths : 'public/stylesheets'
        },
        files: {
          'public/stylesheets/style.css' : 'public/stylesheets/style.less'
        }
      }
    }

	});

  grunt.registerTask('delayed-livereload', 'delayed livereload', function () {
    var done = this.async();
    setTimeout(function () {
      grunt.task.run('livereload');
      done();
    }, 500);
  });

	grunt.loadNpmTasks('grunt-develop');
  grunt.loadNpmTasks('grunt-regarde');
  grunt.loadNpmTasks('grunt-contrib-livereload');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-less');

  grunt.registerTask('start', ['livereload-start', 'develop', 'regarde']);
  grunt.registerTask('default', ['watch']);
};
