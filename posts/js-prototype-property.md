javascript是面向对象语言，除了基本数据类型，其他所有数据类型都是对象类型。
而对象由属性组成，属性描述了一个对象的状态，所以了解对象的继承方式和属性特性是了解js面向对象的基础。

## 一、问题

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
    
这里创建了一个对象obj，调用obj的toString函数，输出了对象信息。
然后遍历对象属性，输出了定义对象时创建的属性num。

那么这里就有两个问题：

    1、为什么对象会有toString函数属性？
    2、既然对象有toString函数属性，为什么在for/in遍历时却不能获取这个属性？
    
要理解这个问题，首先要知道js对象的继承方式。

## 二、继承

要了解js对象的继承方式，需要先了解js对象创建的方式。

### 创建对象的三种方式

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

### 继承

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

## 三、属性

在js中，对象的属性有两种：数据属性和存储器属性。

数据属性和存储器属性有什么区别呢？属性是有特性的，他们的区别看看两种属性的特性就知道了。

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
    
数据属性的value特性定义了属性的值，它可以是任何javascript值，默认是undefined；
当writable为true时，属性值才能被运算符改变。
    
    var o = {};
    Object.defineProperty(o, "num", {
        value: 1,
        writable: false
    });
    o.num = 2;
    console.log(o); //{num:1}
    
这里对象o的num属性为writable为false，所以修改num属性无效，属性值还是保持初始化的值。
在ES5的严格模式下，对non-writable进行修改将会报错。

存储器属性的set、get特性分别为属性提供了setter和getter方法，
setter方法接受一个唯一参数，将该参数分配给属性；
getter方法返回一个值，这个值就被当做该属性的值。

    "use strict";
    function Obj(){
        var num = null;
        Object.defineProperty(this, "num", {
            set: function (newVal) {
                console.log("set!!");
                num = newVal;
            },
            get: function () {
                console.log("get!!");
                return ++num;
            },
            enumerable: true
        });
    }
    
    var o = new Obj();
    //  set!!
    o.num = 1;
    //  get!!
    //  2
    console.log(o.num);
    //  get!!
    //  3
    console.log(o.num);
  
这里为属性num设置了setter/getter方法，所以在设置和获取属性值时都会调用setter/getter方法。

两种属性都有通用的特性就是：enumerable和configurable。
enumerable属性定义了对象的属性是否可以在 for/in 循环和 Object.keys() 中被枚举；
configurable 特性表示对象的属性是否可以被删除，以及除 writable 特性外的其他特性是否可以被修改；

    "use strict";
    
    var o = {};
    Object.defineProperty(o, "num", {
        value: 1,
        writable: true,
        enumerable: false,
        configurable: false
    });
    
    //  {}
    console.log(o);
    
    //  1
    console.log(o.num);
    
    //  TypeError: Cannot delete property 'num' of #<Object>
    delete o.num;

看到这里可以明白，数据属性和存储器属性最大的区别就是setter/getter的区别。
存储器增加了对于属性值的操作，可以实现很多实用的功能。

回到问题：“既然对象有toString函数，为什么在for/in遍历时却不能获取这个函数？”
那么只要看看toString函数的描述符就可以了。

    Object.getOwnPropertyDescriptor(Object.prototype, "toString")
    
    { value: [Function: toString],
      writable: true,
      enumerable: false,
      configurable: true }
      
toString函数是Objct.prototype的属性，enumerable为false所以不可以在 for/in 循环中被枚举。
继承Object.prototype的对象自然也继承了toString函数，所以其toString函数也不可以被枚举。