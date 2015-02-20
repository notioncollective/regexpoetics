/*global module:false*/
module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({

    less: {
      main: {
        files: {
          'assets/css/styles.css' : ['assets/css/src/styles.less']
        }
      }
    },

    watch: {
      css: {
        files: 'assets/css/src/**/*.less',
        tasks: ['less']
      }
    }
  });

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-watch');

  // Default task.
  grunt.registerTask('default', ['less']);

};
