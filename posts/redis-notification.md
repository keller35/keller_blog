redis提供了两种持久化方式，[redis persistence](http://redis.readthedocs.org/en/latest/topic/persistence.html)

1、RDB:定时生成数据快照dump.rdb。

2、AOF:生成操作日志appendonly.aof，redis启动时对数据根据日志操作，获得最新持久化数据。

redis默认开启RDB备份模式，需要开启AOF模式，需要修改redis.conf文件或通过命令参数启动redis-server。命令启动是：`./redis-server --appendonly yes`。长期使用的话建议修改redis.conf文件，找到appendonly no设置为yes，通过`./redis-server ./redis.conf`引用文件启动即可。

***

redis提供的发布订阅，[redis notification](http://redisdoc.com/pub_sub/index.html)

最近有一个需求是设置定时任务，当任务时间到达后，自动触发后续任务。这个需求可以使用redis的[keysapce notification](http://redis.io/topics/notifications)来完成。

keysapce notification是指通知使得客户端可以通过订阅频道或模式，来接收那些以某种方式改动了 Redis 数据集的事件。我这里主要是使用过期时间的删除通知来完成这个需求。

redis默认是关闭keysapce notification的，开启此功能需要修改redis.conf文件，找到notify-keyspace-events，设置为Ex，因为这里过期删除的键事件。然后以`./redis-server ./redis-conf`启动redis。

keyspace notification 还有其他事件可以提供订阅：

* K     Keyspace events, published with __keyspace@<db>__ prefix.
* E     Keyevent events, published with __keyevent@<db>__ prefix.
* g     Generic commands (non-type specific) like DEL, EXPIRE, RENAME, ...
* $     String commands
* l     List commands
* s     Set commands
* h     Hash commands
* z     Sorted set commands
* x     Expired events (events generated every time a key expires)
* e     Evicted events (events generated when a key is evicted for maxmemory)
* A     Alias for g$lshzxe, so that the "AKE" string means all the events.


下面以node.js模拟这个过期事件和订阅后的处理：

	var redis = require('redis');
	var client = redis.createClient();
	var subscribeClient = redis.createClient();


	var key = "mykey";
	var content = "mycontent";
	var expiredTime = 10;//这里单位是s

	//模拟插入数据
	client.multi()
	.set(key, content)
	.expire(key, expiredTime)
	.exec(redis.print);


	//注册监听渠道
	subscribeClient.once("connect", function(){
		var channel = "__keyevent@0__:expired";//监听的渠道名
		subscribeClient.subscribe(channel, redis.print);
	});

	//事件监听回调
	subscribeClient.on("message", function(channel, key){
		console.log("channel is " + channel);
		console.log("key is " + key);
	});
	
但是redis不能保证数据在过期时间到时立刻删除，Redis 2.4版本中，过期时间的延迟在 1 秒钟之内，而在新的 Redis 2.6 版本中，延迟被降低到 1 毫秒之内，所以这也是可以接受的。