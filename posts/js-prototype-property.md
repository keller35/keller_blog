javascript是面向对象语言，除了基本数据类型，其他所有数据类型都是对象类型。
而对象由属性组成，属性描述了一个对象的状态，所以了解对象的继承方式和属性特性是了解js面向对象的基础。

## 问题

首先看一段简单代码：

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
    
这里创建了一个简单对象obj，调用obj的toString函数，输出了对象信息。
然后遍历对象属性，输出了定义对象时创建的属性num。

那么这里就有两个问题：

    1、为什么对象会有toString函数？
    2、既然对象有toString函数，为什么在for/in遍历时却不能获取这个函数？
    
要理解这个问题，首先要知道js对象的创建方式。

## 创建对象的三种方式

js创建对象的有三种方式：

1、对象直接量
    
    var o = {};
    
这是最简单的创建对象的方式，通过对象直接量创建对象
    
2、Object.create()

    var o = Object.create({});
    
通过Object的静态函数create创建对象
    
3、构造函数

    function Obj(){}
    Obj.prototype = {};
    var o = new Obj();

通过构造函数创建对象

那么以上三种创建对象的方式有什么区别？他们对继承有什么影响？下面将做介绍。

## 继承

js不同于基于类的面向对象语言，它的继承是基于原型的。
js中的每个对象，在其内部都会有一个内部链接指向另一个对象，这个对象就是原型对象，一般简称原型。
而被引用的原型内部，也会有一个连接指向另一个对象，以此推类，形成原型链。
最终所有对象的原型链都会指向Object.prototype，而Object.prototype的原型为null，也就是原型链的终点。

查看原型的方法：

    var o = {};
    Object.getPrototypeOf(o);   //Object
    
Object.getPrototypeOf显示对象o的原型为Object。（在一些js环境下，可以通过对象的一个`__proto__`属性获取原型，不过这不是ES的规范，所以不推荐使用）

回到上面三种创建对象的方式，我们可以查看他们的原型：

    var o;
    
    o = {};
    Object.getPrototypeOf(o);   //Object
    
    o = Object.create({num: 1});
    Object.getPrototypeOf(o);   //Object {num: 1}
    
    function Obj(){}
    o = new Obj();
    Object.getPrototypeOf(o);   //Obj {}
    
    Obj.prototype.num = 1;
    o = new Obj();
    Object.getPrototypeOf(o);   //Obj {num: 1}
    
可以看到，通过直接量创建的对象，其内部原型链接指向的就是Object.prototype。
通过Object.create创建的对象，其内部原型链接指向的就是函数中的参数。
通过构造函数创建的对象，其内部原型链接指向的就是构造函数的原型。

关于为什么原型不是Object，而是Object.prototype？
这就是跟js的原型继承方式有关，对象之间的继承方式是通过原型继承，也就是继承关系是在对象与对象之间进行的。
而Object是什么，是构造函数，构造函数是标识对象创建方式的。
这里有个图可以帮助理解。

![prototype](../img/prototype.png)

可以看到，对象只继承自原型。
构造函数也有自己的prototype属性，它指向的也是原型，而原型对象中的一个叫constructor的属性指向的是构造函数。
这里的关系就是说：继承关系是在对象之间进行的，但是定义继承关系的是构造函数。如果把构造函数的原型属性改为指向其他对象，那么通过这个构造函数创建的对象也将继承自新的原型对象。

讲到这里，也就解决了第一个问题。
通过对象直接量创建的对象，它继承自Object.prototype，而Object.prototype定义了很多函数，其中就包括toString。所以，我们创建的对象也就继承了toString函数。

至于另一个问题，则需要往下看。

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
