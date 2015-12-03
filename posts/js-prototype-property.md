javascript是面向对象语言，除了基本数据类型，其他所有数据类型都是对象类型。
而对象由属性组成，属性描述了一个对象的状态，所以了解对象的继承方式和属性特性是了解js面向对象的基础。

## 问题

首先来看一段简单代码：

    // 创建对象
    var obj = {num: 1};
    
    // 调用对象的toString
    // [object Object]
    obj.toString();    
    
    // 遍历对象属性
    // num:1
    for(var key in obj){
        console.log(key + ":" + obj[key]);
    }
    
这里创建了一个简单对象obj，调用obj的toString方法，输出了对象信息。
然后遍历对象属性，输出了定义对象时创建的属性num。

那么这里就有两个问题：

    1、为什么对象会有toString方法？
    2、既然对象有toString方法，为什么在for/in遍历时却不能获取这个方法？
    
要理解这个问题，首先要知道js对象的继承方式：

## 继承

js不同于基于类的面向对象语言，它的继承是基于原型的。
js中的每个对象，在其内部都会有一个指向另一个对象的属性，这个属性就是原型属性，一般简称做原型。
而被引用的对象内部，也会有一个原型指向另一个对象，以此推类，形成原型链。
最终所有对象的原型链都会指向Object.prototype，而Object.prototype的原型为null，也就是原型链的终点。

## 创建对象的三种方式

js创建对象的有三种方式：

1、对象直接量
    
    var o = {};
    
这是最简单的创建对象的方式，通过对象直接量创建的对象，其原型是Object
    
2、Object.create()

    var o = Object.create({});
    
通过create函数创建的对象，其原型是Object
    
3、构造函数

    function Obj(){}
    Obj.prototype = {};
    var o = new Obj();

通过构造函数创建的对象，其原型是构造函数的原型对象

## 属性的类型

在js中，对象的属性有两种：数据属性和存储器属性

数据属性和存储器属性有什么区别呢？看看两种属性的特性就知道了。

数据属性的特性包括：

    value:属性值
    writable:可写性
    enumerable:可枚举性
    configurable:可配置性
    
存储器属性的特性包括：
    
    set
    get
    enumerable:可枚举性
    configurable:可配置性
    
两种属性都有通用的特性就是：enumerable和configurable，

## 属性的特性

## 继承
构造函数--原型--对象