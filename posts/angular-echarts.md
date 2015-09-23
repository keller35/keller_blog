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

