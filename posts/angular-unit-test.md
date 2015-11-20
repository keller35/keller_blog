一直以来有个疑问：angular是怎么进行测试的？

例如我自己开发的控制器和服务，依赖于angular的调用，结果依赖于html的渲染，而且他们之间还会存在互相依赖。
如果需要进行单元测试，这些依赖问题都是怎么解决的呢？

直到最近google了一些文章和查了angular的文档，终于知道了angular的测试方法。

angular为了提供开发者一个可测试的开发环境，专门提供了一个叫angular-mock的模块，
在测试中导入这个模块，利用这个模块可以模拟出angular的环境，开发者直接在环境中运行单元测试代码就可以获得测试结果。

下面记录一下自己的实践过程：

这次测试的是指令和控制器，首先创建自己的指令和控制器，代码如下：

    angular.module('myApp', [])
    
        .directive('myDirective', [function () {
            return {
                restrict: 'E',
                replace: true,
                template: '<h1>这里展示的是{{1+1}}</h1>'
            };
        }])
    
        .controller('mycontroller', function ($scope) {
            $scope.username = "";
            $scope.getNameLength = function () {
                return $scope.username.length;
            }
        });
        
接下来是单元测试代码,这里使用的测试框架是[Jasmine](https://github.com/jasmine/jasmine),
Jasmine是一个行为驱动的测试框架，使用起来还是很方便的。

directive的测试代码如下：

    describe('unit testing mydirective', function() {
        var $compile,
            $rootScope;
    
        // Load the myApp module, which contains the directive
        beforeEach(module('myApp'));
    
        // Store references to $rootScope and $compile
        // so they are available to all tests in this describe block
        beforeEach(inject(function(_$compile_, _$rootScope_){
            // The injector unwraps the underscores (_) from around the parameter names when matching
            $compile = _$compile_;
            $rootScope = _$rootScope_;
        }));
    
        it('element show whith value 2', function() {
            var element = $compile("<my-directive></my-directive>")($rootScope);
            $rootScope.$digest();
            expect(element.html()).toContain("这里展示的是2");
        });
    });
    
controller的测试代码如下：

    describe('unit testing mycontroller', function() {
    
        beforeEach(module('myApp'));
    
        var $controller;
        beforeEach(inject(function(_$controller_){
            // The injector unwraps the underscores (_) from around the parameter names when matching
            $controller = _$controller_;
        }));
    
        describe('testing $scope.getNameLength', function() {
            it('set the username to "keller" and the return length is 6', function() {
                var $scope = {};
                var controller = $controller('mycontroller', { $scope: $scope });
                $scope.username = 'keller';
                var len = $scope.getNameLength();
                expect(len).toEqual(5);
            });
        });
    });
    
Jasmime的测试启动可以通过Jasmime提供的命令行工具，也可以使用gulp插件。
因为这里的angular代码需要在浏览器中测试其兼容性，所以还可以使用[Karma](https://github.com/karma-runner/karma)，
Karma基于配置，提供了Jasmine的插件，而且可以自动调用浏览器进行测试，自动化程度很高。

Karma安装：

    npm install karma --save-dev
    
Karma的配置文件karma.config.js如下：

    module.exports = function(config){
      config.set({
    
        basePath : './',
    
        files : [
          'app/bower_components/angular/angular.js',
          'app/bower_components/angular-mocks/angular-mocks.js',
          'app/components/version/*.js'
        ],
    
        autoWatch : true,
    
        frameworks: ['jasmine'],
    
        browsers : ['Chrome', 'Safari'],
    
        plugins : [
                'karma-chrome-launcher',
                'karma-safari-launcher',
                'karma-jasmine',
                'karma-junit-reporter'
                ],
    
        junitReporter : {
          outputFile: 'test_out/unit.xml',
          suite: 'unit'
        }
    
      });
    };
    
这里可以看到在测试文件前导入了angular.js作为angular环境和angular-mocks.js在单元测试中解决angular依赖的问题。

browsers指定测试的浏览器，我的电脑上只有chrome和Safari，所以这里只测试这两种浏览器。测试对应的浏览器还需要配置相应的插件，插件可以从npm下载：

    npm install karma-jasmine --save-dev   
    npm install karma-chrome-launcher --save-dev   
    npm install karma-safari-launcher --save-dev  
     
后面plugins就是需要配置的插件，这里的karma-junit-reporter主要用于生成格式化的测试报告。

最后执行测试命令：

    //默认读取karma.config.js
    ./node_modules/karma/bin/karma start
    
得到测试结果：

    ➜  angular-seed-master  ./node_modules/karma/bin/karma start
    INFO [karma]: Karma v0.12.37 server started at http://localhost:9876/
    INFO [launcher]: Starting browser Chrome
    INFO [launcher]: Starting browser Safari
    INFO [Chrome 46.0.2490 (Mac OS X 10.10.5)]: Connected on socket Z_KChLdZgHvD_UdXm-cB with id 41507097
    INFO [Safari 9.0.1 (Mac OS X 10.10.5)]: Connected on socket 0vtQZksAoULRpZrRm-cA with id 62705961
    Chrome 46.0.2490 (Mac OS X 10.10.5): Executed 2 of 2 SUCCESS (0.123 secs / 0.119 secs)
    Safari 9.0.1 (Mac OS X 10.10.5): Executed 2 of 2 SUCCESS (0.032 secs / 0.03 secs)
    TOTAL: 4 SUCCESS

