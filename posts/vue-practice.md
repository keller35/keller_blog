Vue.js实践记录：

[Vue.js](http://cn.vuejs.org/) 是一个MVVM框架，由[Evan You](https://github.com/yyx990803)大神开发。

vue类似于angular，但是更加轻便，更专注于ViewModel，上手也更加简单。

例子:

	<script src="vue.js"></script>

	<div id="demo">
  		{{message}}
  		<input v-model="message">
	</div>

	<script>
		var data = {
      		message: 'Hello Vue.js!'
    	};
  		var vm = new Vue({
    		el: '#demo',
    		data: data
  		});
	</script>
	
以上一个简单的example，vue通过实例化Vue对象，可以实现与指定view和model的双向绑定，而Vue对象本身是一个viewmodel。

Vue实例返回的是一个ViewModel对象，通过这个对象，可以操作这个vm绑定的DOM，即`vm.$el`；也可以操作这个vm绑定的model，即`vm.$data`，vm就是双向绑定的中间联系。vm还有很多实例方法，如数据监视，通过`vm.$watch()`可以监视model的变化，执行监视函数；又如事件通讯，通过`vm.emit()`可以发布事件，`vm.on()`可以监听事件。这些方法在开发中都有很使用的地方，具体可见[文档](http://cn.vuejs.org/api/instance-methods.html)。

Vue的model绑定是基于js的GET/SET访问器实现的dependency tracking，按照vue作者的话说会比angular的dirty checking效率高，但是使用的时候就会有一些限制。

`vm.$data`指向的是model，但其实这个model对象已经跟实例化的时候指定的model有了一些变化，vue自动为model增加了SET/GET访问器，所以这也是vue双向绑定的原理。因为有了SET/GET访问器,model上的变化，通过访问器触发了view的变化，也就达到了双向绑定的目的。也正是因为这样，下面的例子不能达到双向绑定的效果。

	<script src="vue.js"></script>

	<div id="demo">
  		{{message}}
  		<input v-model="message">
  		{{key}}
  		<input v-model="key">
	</div>

	<script>
		var data = {
      		message: 'Hello Vue.js!'
    	};
  		var vm = new Vue({
    		el: '#demo',
    		data: data
  		});
  		setTimeout(function(){
  			data.key = "value";
  		}, 1000);
	</script>
	
这是因为新增的属性没有SET/GET访问器，属性的变化将不会触发view层的更新。所以vue提供了`vm.$add()`方法来支持新增属性，删除属性的话也可以使用`vm.$delete`方法。

Vue的指令功能也很强大，类似于angular的指令，主要是用于view层的操作。

同时，vue提供了组件系统，可以扩展vue，封装自己的组件达到复用的目的。因为这一块实践较少，后续补上。
	