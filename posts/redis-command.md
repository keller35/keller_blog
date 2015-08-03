redis数据结构：
(数据结构指的是键值对中值的类型，键一定为字符串)
http://www.yiibai.com/redis/redis_data_types.html
1、字符串 
set get 
value
2、哈希值 
hset hget hgetall 
username keller age 24
3、列表(有序集合)
lpush lrange 0 10
value
4、集合(无序集合)
sadd smembers
value
5、集合排序(有序不重复集合，通过分数排序)
zadd zrangebyscore
zadd tutoriallist 0 redis