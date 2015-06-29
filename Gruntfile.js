module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
            },
            build: {
                src: 'static/js/highlight.js',
                dest: 'static/js/highlight.min.js'
            }
        }
    });

    // 加载包含 "uglify" 任务的插件。
    grunt.loadNpmTasks('grunt-contrib-uglify');

    // 默认被执行的任务列表。
    //grunt.registerTask('default', ['uglify']);
    grunt.registerTask('default', '渲染ejs模板', function(){
        grunt.task.run('uglify');
        require('./bin/compile.js').compile();
    });

};