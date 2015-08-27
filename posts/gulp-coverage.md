gulp：

关于什么是gulp？可以点这里[这里](http://www.w3ctech.com/topic/134)

这里主要描述一下gulp的以下两个插件的使用.

* [gulp-mocha](https://www.npmjs.com/package/gulp-mocha)
* [gulp-coverage](https://github.com/dylanb/gulp-coverage)

gulp-mocha的功能主要是完成自动化的mocha测试，对于测试结果，使用gulp-coverage可以生成比较直观的测试结果报告。

下面是具体实例：

![gulp](../img/gulp1.png)

index.js是待测试代码：

	/*
	* index.js
	* 返回较大值
	* */
	module.exports = function f(x, y){
    	return x > y ? x : y;
	};
	
test.js是mocha的测试脚本，对index.js中的f函数进行测试：

	// test.js
	var assert = require("assert");
	var index = require("../src");

	describe('Index', function() {
    	describe('#index()', function () {
        	it('should return the bigger number', function () {
            	assert.equal(1, index(1, 0));
            	assert.equal(0, index(-1, 0));
            	assert.equal(0, index(0, 0));
        	});
    	});
	});
	
gulpfile.js是gulp脚本：

	var gulp = require('gulp');
	mocha = require('gulp-mocha');
	cover = require('gulp-coverage');

	gulp.task('mocha', function(){
    	return gulp.src("test/test.js", {read: false})
        	.pipe(cover.instrument({
            	pattern: ['**/test*'],
            	debugDirectory: 'debug'
        	}))
        	.pipe(mocha())
        	.pipe(cover.gather())
        	.pipe(cover.format())
        	.pipe(gulp.dest('reports'));
	});

	gulp.task('default', ['mocha']);
	
gulp配置了两个任务(task)，默认任务调用了'mocha'任务，而'mocha'任务主要就是利用前面提到的两个插件完成测试和生成报告的作用。

gulp.src函数读取要执行的脚本文件，通过stream的方式pipe进行数据传递，cover.instrument必须在所有操作之前调用，中间调用mocha，而cover.gather和cover.format则必须在测试脚本执行后调用。cover.instrument有两个参数，pattern指定被测试的源文件的目录，debugDirectory指定生成测试资源（文档的原话是"This is useful for debugging gulp-coverage itself",对使用貌似没有用处）。最后用gulp.dest指定测试报告生成目录即可。

运行	gulp 命令后目录结构如下：

![gulp](../img/gulp2.png)

coverage.html就是测试报告，长这样：

![gulp](../img/reporter.png)

100% coverage , hah !!!



