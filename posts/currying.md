# 柯里化

柯里化是指把接收多个参数的函数变换成接收单个参数，最后返回接收余下参数的函数的技术。我的理解就是将原本的函数的部分参数固定，返回一个接收子集参数的函数，也就是这个函数是原本参数的子函数。

Talk is cheap,show me the code!

1、一个例子：

有函数如下：

	function add(a, b){
    	return a + b;
	}

以上函数就是简单的加法函数，如果我们的需求是获取一个求取任何数加上5的函数，显然这是此加法函数的子集，于是我们可以将此函数柯里化如下：

	function add5(b){
    	return add(5, b);
	}
	
柯里化后的函数只接收余下的一个参数，通过调用原有函数，返回结果，这就是函数的柯里化。

把以上柯里化的方法抽象出来，就是如下的curry函数：

	function curry(fn) {
    	var slice = Array.prototype.slice,
    	//截取固定参数
    	__args = slice.call(arguments, 1);
    	return function () {
    		//截取非固定参数
        	var __inargs = slice.call(arguments);
        	//合并参数，实际调用
        	return fn.apply(null, __args.concat(__inargs));
        };
	}
	
使用这个通用函数来柯里化add函数如下：

	var add5 = curry(add, 5);
	
那么，我们可以直接使用`add5(6)`求5+6的值。

2、又一个例子：

将原来的add函数升级为三个参数相加：

	function add(a, b, c){
    	return a + b + c;
	}

使用curry函数进行柯里化：

	var add5 = curry(add, 5);
	
那么，我们可以使用`add5(6, 7)`求的5+6+7的值

再进一步柯里化：

	var add5and6 = curry(add, 5, 6);

`add5and6(7)`就是求值5+6+7。

3、自动柯里化

可以看出，如果需要封装柯里化的函数，都需要从原始函数开始进行封装。所以需要寻找一种可以实现逐层封装的方法，即在`add5`的基础上通过`var add5and6 = add5(6)`封装出`add5and6`。

所以，以下是一个更通用的柯里化函数：

	function currying(fn, length) {
    	length = length || fn.length;
    	return function () {
        	if (arguments.length < length) {
            	var combined = [fn].concat(toArray(arguments));
            	return length - arguments.length > 0
                ? curry(curry.apply(this, combined), length - arguments.length)
                : curry.call(this, combined );
        	} else {
            	return fn.apply(this, arguments);
        	}
    	};
	}

这个curring是对原有curry函数的升级，它对于传入的参数个数进行判断，如果参数个数未达到原函数的个数，则继续进行函数柯里化，也就是不断返回子集函数，直到参数达到求值个数。这也称为“自动柯里化”。

有了currying函数，柯里化变得更加简单:

	//自动柯里化表现为链式调用
	//实际传值在最后进行
	var c_add5and6 = currying(add)(5)(6);
	var result = c_add5and6(7);

4、柯里化的优势：

a、提高适用性：柯里化就是通过组合简单的函数来实现可以在专一条件下使用的函数。当然，提高了适用性，也就拒绝了通用性。

b、惰性求值：通过链式调用，可以进行柯里化封装，但是最终结果运算会直到达到参数个数才会进行。这样可以避免中间运算，从而保证代码性能。

# Ramdajs

[Ramdajs](https://github.com/ramda/ramda)是一个api库，他提供了数据操作的api，类似于underscore，但是Ramdajs所有api都实现了自动柯里化，所以使用起来更加优雅，相对于underscore性能也会更好。

以下是一些Ramdajs的例子：
	
	var R = require('ramda');
	
	R.add(2, 3);       	//=>  5
	R.add(2)(3);      	//=>  5
	
	//自动柯里化
	R.equals(1, 1); 	//=> true
	R.equals(1)(1); 	//=> true
	
	//函数参数也可以柯里化
	var double = function(x) {
  		return x * 2;
	};
	R.map(double, [1, 2, 3]); //=> [2, 4, 6]
	R.map(double)([1, 2, 3]); //=> [2, 4, 6]
	
underscore与ramda的对比：

	//按age排列数据，然后格式化输出
	
	var _ = require('underscore');
	var R = require('ramda');

	var data = [{
    	name: 'a',
    	age: 20
	}, {
    	name: 'b',
    	age: 22
	}, {
    	name: 'c',
    	age: 24
	}, {
    	name: 'd',
    	age: 18
	}];

	//underscore的实现
	//参数需要最先传入，难以复用
	//value ==> [ 'd is 18', 'a is 20', 'b is 22', 'c is 24' ]	
	var value = _.chain(data)
    	.sortBy(function (person) {
        	return person.age;
    	}).map(function (person) {
        	return person.name + " is " + person.age;
    	}).value();

	
	//ramda的实现
	//可封装出适用函数，参数为最后传入
	//传入最终值才会进行求值，否则返回柯里化函数
	//value ==> [ 'd is 18', 'a is 20', 'b is 22', 'c is 24' ]
	var sortByAgeFormat = R.compose(R.map(function (person) {
    	return person.name + " is " + person.age;
	}), R.sortBy(R.prop('age')));
	var value = sortByAgeFormat(data);

更多api可以查看[ramda api](http://ramdajs.com/docs/)

===

参考资料：

http://fr.umio.us/why-ramda/

http://blog.jobbole.com/77956/