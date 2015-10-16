最近在做一个数据统计系统，需要对生产环境产生的数据进行统计和分析，最后在前端生成图表信息。

在执行一条sql的时候，发现执行速度很慢，在测试数据库就需要二十秒。

sql对两个表进行了连接，还进行了分组，sql大概是这个样子的：

    select a.title 'title',count(b.id) 'count'
    from a left join b on a.id = b.a_id and b.type = 1
    group by a.id
    order by a.create_date desc
    limit 0,20

于是查询sql的执行计划如下：

![post](../img/index-optimize1.png)

可以看到sql的执行顺序是：

1、表a进行了ALL全表扫描，这里key显示为null，所以表a的主键索引没有被用到。
using temporary和using filesort说明mysql先对表a进行了group by和order by，因为连接是left join，所以先group by也不会影响最后的结果集。

2、表b也进行了ALL全表扫描。过滤表b后进行表连接操作，这里使用的是using join buffer。

所以进行优化步骤如下：

1、可以看到这里先对表b进行了using where过滤，扫描了520843行，这已经是全表扫描了。所以为了减少表b的扫描数，可以对表b的连接字段a_id建立索引。

索引建立后的执行计划如下：

![post](../img/index-optimize2.png)

优化后表a和表b都利用了索引index2,所以表b也不需要进行ALL全表扫描，sql执行速度提高了很多，基本只要一秒的时间。

2、因为连接的时候还有另外一个`b.type = 1`的条件，所以建立表b的`a_id`和`type`的联合索引

索引修改后的执行计划如下：

![post](../img/index-optimize3.png)

优化后的执行计划，ref字段显示连接的条件中的a_id和type被充分利用，这是一个最优解的情况。

总结：

mysql优化建议里就有这样一条：在join的时候连接字段使用相同的类型并为他们建立索引。
所以其实这次的sql优化就是验证了这条建议。
但是建立索引有可能影响数据插入操作的性能，所以如果影响到了的话，那么也不能为了数据统计的性能去牺牲插入的性能，毕竟插入操作的性能是直接关系着业务接口的性能。
当然如果出现这种情况的话，在数据统计系统这边也可以利用中间表，通过程序设定定时查询功能，将统计的数据缓存在中间表中，这样也就不会依赖于查询的性能问题了，不过这样也会牺牲数据的即时性。

