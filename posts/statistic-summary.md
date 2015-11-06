数据统计系统开发总结

最近一段时间开发了公司一款产品的数据统计系统，主要是对产品产生的数据进行收集，按照不同维度进行统计后，在前台利用图表的形式展示出来。
这次开发的过程中也遇到了一些有意思的问题，所以在这片博文中就记录一下本次开发的“心路历程”~

### 0、背景

后端使用node.js，数据库使用MySQL；前端使用angular和bootstrap。

### 1、后台接口的数据格式

因为前端获取数据都是通过Ajax的形式请求的，所以后端响应使用的是json格式。

在代码开发过程中，为了能够实现代码复用，我尽可能的将数据控制为统一的格式，这样前端对数据的解析就可以使用同一套代码。

在这其中，主要由两种固定的数据形式：

1）指标、指标值的形式：将键值对封装成一个json，多个键值对形成数组

	[
        {
          "key": "aaa",
          "value": 111
        },
        {
          "key": "bbb",
          "value": 222
        }
    ]
    
2）多组数据形式：将多组数据全部封装到一个json，前端不同业务数据都从这个json中读取。
（因为在前端，单页面内多个相似的业务是同时请求数据的，所以把相似的业务请求统一为一个请求，可以减小http请求开销）

    {
        totalCount: 9999,
        details: [
            {
                time: "20150101",
                count: 100
            }
            ...
        ],
        appDetails: [],
        wechatDetails: []
    }
    
### 2、前端数据格式化工具

因为后端数据格式基本是固定的，所以我在前端开发了一个`utilsService`的对象，这个对象作为一个angular的服务，可以注入到各个controller中，
这样就可以在各个controller中使用通用的数据格式化工具。

    angular.module('app.utilsService', [])
        .factory('utilsService', function(){
        
        return {
            ...
        };
    }
    
`utilsService`服务中有一个功能是对日期进行补全。

之所以要对接口数据中的日期进行补全，是因为后端MySQL对日期进行分组的时候，只会对存在的日期进行分组，这样就导致数据中的日期中可能出现缺失，
而图表又要求日期必须是连续的，这样就需要对日期进行补全。

而不在后端进行补全操作是因为担心这样的IO操作影响node的性能，毕竟单进程嘛，所以放在客户端应该是较好的选择。

### 3、angular directive的封装

系统图表的展示我选择的是baidu出品的echarts，但是原生echarts是基于DOM操作的，所以既然选择使用angular，再对DOM进行操作总感觉不妥，而且很难利用双向绑定的优势，所以将echarts封装成directive是最好的选择。

    //directive代码
    angular.module('ui.echarts', [])
        .directive('eChart', [function () {
        
        function link(){
        
            // 基于准备好的dom，初始化echarts图表
            var myChart = echarts.init(element[0]);
    
            //监听options变化
            if (attrs.uiOptions) {
                attrs.$observe('uiOptions', function () {
                    var options = $scope.$eval(attrs.uiOptions);
                    if (angular.isObject(options)) {
                        myChart.setOption(options, true);
                    }
                }, true);
            }
        }
        
        return {
            restrict: 'A',
            link: link
        };
    }
    
    //html代码
    <div e-chart ui-options="{tooltip: {show: true},
        legend: {
            data: ['销量']
        },
        xAxis: [
            {
                type: 'category',
                data: ['衬衫', '羊毛衫', '雪纺衫', '裤子', '高跟鞋', '袜子']
        }
        ],
        yAxis: [
        {
        type: 'value'
        }
        ],
        series: [
        {
        'name': '销量',
        'type': 'bar',
        'data': {{data}}
        }
        ]}" style="height: 400px;width: 100%;">
    </div>
    
这里也只是实现了最简单的封装：根据参数`ui-options`初始化图表，然后监听此参数，如果参数变化，将重新绘制图表。
于是在业务中，我的主要变化是参数中`data`的改变，我通过控制`data`就可以控制图表，也就达到了双向绑定的目的。[代码](https://github.com/keller35/Angular-ECharts)

系统使用的另外一个开源组件angular ui-select，内部的封装更加复杂。
angular directive使用起来给人的感觉是特别繁琐，概念太多，不过封装一个通用性很高的directive本身就是一项复杂的工作。

### 4、sql优化

目前对于sql优化所做的工作就是利用索引。

首先测试所有sql的执行时间，挑选慢sql进行优化。对慢sql进行explain，对于where条件，如果type显示为ALL而且rows数很多，显然需要进行索引优化了。

因为最左前缀原则的限制，索引列的选择优先考虑当前慢sql的优化，如果可以的话再考虑其他sql。

比如有如下sql的explain：

    explain
    select a.id 'aid',b.id 'bid' 
    from a join b on a.c_id = b.id 
    and a.type = 2
    
    +----+-------------+-------+-------+---------------+--------+---------+
    | id | select_type | table | type  | possible_keys | key    | key_len |
    +----+-------------+-------+-------+---------------+--------+---------+
    |  1 | SIMPLE      | a     | ALL   | NULL          | NULL   | NULL    |
    |  1 | SIMPLE      | b     | index | NULL          | index2 | 198     |
    +----+-------------+-------+-------+---------------+--------+---------+
    
    +------+------+-----------------------------------------------------------------+
    | ref  | rows | Extra                                                           |
    +------+------+-----------------------------------------------------------------+
    | NULL | 8869 | Using where                                                     |
    | NULL | 8522 | Using where; Using index; Using join buffer (Block Nested Loop) |
    +------+------+-----------------------------------------------------------------+
    
一个简单的join和where，但是a表进行了全表扫描，效率很低。

这里为表a创建索引idx_id_type(c_id, type),索引后再explain如下，因为直接查询索引，表a扫描行数仅剩2行：

    +----+-------------+-------+-------+---------------+-------------+---------+
    | id | select_type | table | type  | possible_keys | key         | key_len |
    +----+-------------+-------+-------+---------------+-------------+---------+
    |  1 | SIMPLE      | b     | index | NULL          | index2      | 198     |
    |  1 | SIMPLE      | a     | ref   | idx_id_type   | idx_id_type | 262     |
    +----+-------------+-------+-------+---------------+-------------+---------+
    
    +------------+------+----------+--------------------------+
    | ref        | rows | filtered | Extra                    |
    +------------+------+----------+--------------------------+
    | NULL       | 8522 |   100.00 | Using index              |
    | func,const |    2 |   100.00 | Using where; Using index |
    +------------+------+----------+--------------------------+