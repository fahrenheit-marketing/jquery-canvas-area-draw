/*jshint node:true, quotmark:single */
'use strict';
module.exports = function (grunt) {
  grunt.initConfig({
    uglify: {
      build: {
        files: {
          'jquery.canvasAreaDraw.min.js': 'jquery.canvasAreaDraw.js'
        }
      }
    }
  });
  for (var key in grunt.file.readJSON('package.json').devDependencies) {
    if (key !== 'grunt' && key.indexOf('grunt') === 0) {
      grunt.loadNpmTasks(key);
    }
  }
  grunt.registerTask('default', ['uglify']);
};

