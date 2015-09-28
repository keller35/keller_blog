Echarts是一个开源的图表组件，图表比较丰富，工作中需要用到它来搭建一个数据展示系统。但是系统原有的框架是基于angular的，而echarts是基于原生js的，如果直接使用的话就丢失了angular双向绑定的优势，而且后续代码不好维护，所以需要将echarts封装成一个通用的angular组件。

echarts原生实现如下：

	<!-- 为ECharts准备一个具备大小（宽高）的Dom -->
    <div id="main" style="height:400px"></div>
    <!-- ECharts单文件引入 -->
    <script src="http://echarts.baidu.com/build/dist/echarts-all.js"></script>
    <script type="text/javascript">
        // 基于准备好的dom，初始化echarts图表
        var myChart = echarts.init(document.getElementById('main')); 
        
        var option = {
            tooltip: {
                show: true
            },
            legend: {
                data:['销量']
            },
            xAxis : [
                {
                    type : 'category',
                    data : ["衬衫","羊毛衫","雪纺衫","裤子","高跟鞋","袜子"]
                }
            ],
            yAxis : [
                {
                    type : 'value'
                }
            ],
            series : [
                {
                    "name":"销量",
                    "type":"bar",
                    "data":[5, 20, 40, 10, 10, 20]
                }
            ]
        };

        // 为echarts对象加载数据 
        myChart.setOption(option); 
    </script>
    
echarts的使用比较简单，只要提供一个DOM容器，通过js提供的echarts对象进行初始化就可以，而初始化参数option是一个js对象，可以说echarts是基于配置的。

那么依照这个思路，通过angular封装出来的指令，只需要提供一个数据配置接口即可实现图表的展示，而且可以实现数据与视图的双向banding，使用只需要通过修改数据来获得图表的刷新。

所以自定义directive如下：

    angular.module('app', []).directive('eChart', [function () {
    
            function link($scope, element, attrs) {
    
                // 基于准备好的dom，初始化echarts图表
                var myChart = echarts.init(element[0]);
    
                //监听options变化
                if (attrs.uiOptions) {
                    attrs.$observe('uiOptions', function () {
                        var options = $scope.$eval(attrs.uiOptions);
                        if (angular.isObject(options)) {
                            myChart.setOption(options);
                        }
                    }, true);
                }
    
            }
    
            return {
                restrict: 'A',
                link: link
            };
        }]).controller('pieController', ['$scope', function ($scope) {
    
            function initData() {
                var arr = [];
                for (var i = 0; i < 6; i++) {
                    arr.push(parseInt(Math.random() * 100));
                }
                return arr;
            }
    
            var data = initData();
            console.log(data);
            $scope.data = data;
    
            $scope.changData = function () {
                var data = initData();
                console.log(data);
                $scope.data = data;
            }
    
        }]);

这里提供了attribute式的directive，只要在dom标签中声明了`e-chart`属性，angular将会使用echarts初始化这个dom结构，而初始化的参数就是directive声明中的另外一个属性`ui-options`。所以，在controller中，只需要将配置参数绑定在$scope上，然后在dom结构中将这个参数赋值给`ui-options`即可实现初始化，后续需要更新图表则直接修改$scope上的参数即可。

html结构如下：

    <div class="col-xs-12" ng-controller="pieController">
        <button ng-click="changData()">click me</button>
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
        ]}" style="height: 400px;width: 100%;"></div>
    </div>
