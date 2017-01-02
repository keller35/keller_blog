刚开始用React的时候，经常会出现this绑定错误的问题，导致获取不到组件的state和props。

虽然这是js语言本身带来的坑，但是作为填坑人，解决这个问题也是义不容辞的任务，哈哈。

其实梳理一下React中this绑定的出现情况，还是有解决问题的最佳实践的。

首先引出问题：

## 一、不同组件创建方式的this绑定问题

1、通过`React.createClass`方式创建的组件，React在创建时会将内部函数自动绑定this为组件实例，所以除非修改this绑定，否则this都会指向组件实例。

这种方式通常情况下没有问题，但是某些情况下会导致误解。因为React已经假设你的所有handler都是来自当前定义组件，所以this默认指向当前组件实例。

作为一个框架，本不应该假设用户的使用场景，这样的假设侵入性太大，所以React推荐使用另外一种方式定义组件。

2、通过`extends React.Component`方式创建的组件，内部函数默认不绑定this。

其中，生命周期相关的函数由组件实例调用，例如render、componentDidMount函数都会通过`component.render()`的方式调用，所以函数中的this默认指向实例对象，这些都没问题。

但是，类似event handler这样的函数，它们的调用方式有千万种可能，其中最有可能来自子组件的调用，如：

    class Inner extends React.Component {
        constructor(props){
            super(props);
        }
        render() {
            return <p onClick={this.props.handler}>click here</p>;
        }
    }

    class Outer extends React.Component {
        handler() {
            console.log(this);
        }
        render() {
            return <Inner handler={this.handler}></Inner>;
        }
    }

子组件通过这种方式调用父组件定义的handler，那么handler里的this就指向window对象，因为dom结构的event handler是由global的window对象调用的。

所以，这样会出现丢失this的情况。

## 二，解决extends Component的this绑定问题

React推荐通过`extends React.Component`的方式定义组件，所以当我们在handler中需要获取state或者props时，就要解决this绑定的问题。

有以下两种方法来初始化handler的this：

1、在`constructor`里绑定this，如

    class Comp extends React.Component {
        constructor(props){
            super(props);
            this.myHandler = this.myHandler.bind(this);
        }
        myHandler() {
            console.log(this);
        }
    }

这种方式利用在constructor中this指向实例来提前绑定到handler的this。

2、利用箭头函数this的默认绑定

    class Comp extends React.Component {
        constructor(props){
            super(props);
        }
        myHandler = () => {
            console.log(this);
        }
    }

myHandler定义为箭头函数，那么this就指向定义时的函数作用域中的this，也就是组件实例。

其实原理跟第一种一样，但是方法会优雅很多。

## 三、总结

使用`extends`方式定义组件，该绑定this的handler通过箭头函数提前绑定，不需要绑定this的注意使用时的this指向，that's all。