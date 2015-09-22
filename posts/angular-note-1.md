最近工作中需要用到angular指令来封装一些可重用的组件，所以在学习的过程中记录一下学习笔记：

angular directive是DOM元素上的标记，可以是元素、属性或类，不同的指令赋予DOM特定的行为。开发指令，实际上就是将这些特定行为进行封装，angular会根据指令渲染出相应的DOM结构。

	angular.module('modulaName', [])
		.directive('directiveName', ['$param', function(param){
			return {
    			restrict: 'AEC',
    			replace: true,
    			template: '<p style="background-color:{{color}}">Hello World</p>',
    			link: function(scope, element, attrs) {
      				elem.bind('click', function() {
        				elem.css('background-color', 'white');
        				scope.$apply(function() {
          				scope.color = "white";
        			});
      				elem.bind('mouseover', function() {
        				elem.css('cursor', 'pointer');
      				});
    			}
  			};
		}]);
		
1、定义指令需要在angular的模块下定义，指令的作用于范围也限定于模块内:
		
2、定义的directive通常需要返回一个对象，声明了directive的结构，link属性可以构建directive的逻辑；在最简单的情况下，也可以返回一个link函数，其他选项均为默认设置。

3、`directiveName`是指令名称，唯一标示指令，指令在DOM中的声明可以是元素名、属性名或者类名，分别对应`restrict`的AEC。

4、`replace`指定新指令生成的DOM结构是否覆盖声明的DOM结构。

5、`template`是指令生成的DOM结构的模板，也可以引用独立的html文件。

6、link函数是最重要的部分，可以直接对指令进行逻辑操作。

7、link函数`scope`参数默认指向的是父controller的$scope，不仅可以获取控制器绑定的值，还可以修改。因为修改controller的$scope可能会产生不必要的影响，所以angualr提供三种scope属性的配置：

	scope: {
		color: '@'，
		color: '='，
      	sayHelloIsolated: '&sayHello'
    },
    
	`@`指定scope中的color属性为单向绑定，directive中可以获取属性值但是修改不影响父scope的属性值。
	`=`指定scope中的color属性为双向绑定，directive中对scope的修改将影响父scope。
	`&`指定scope中的函数指向父scope中的函数，这样在directive就可以直接调用父scope中的函数了。
	
8、link函数`element`参数是一个jqLite封装的对象，jqLite是jquery的子集，所以对element的操作就像对jquery对象的操作使用。

9、link函数`attrs`参数是键值对对象，在DOM元素上声明的属性都可以在这个对象上获取，通常在属性的声明上使用类`a-b`写法，而在参数中使用`aB`的驼峰写法获取，这个是默认的。
	
10、通过link函数的参数可以看到，有了元素对象和元素属性，就可以进行定制化的指令开发。而通过scope对象获取用户自定义属性，则可以使指令更加个性化。

最后来点感慨：angular的概念非常多，而且不易理解，感觉学习曲线是陡峭上升的。接触一段时间之后，个人的感觉是先理解概念以及概念之间的关联，再进行开发就会顺畅很多。