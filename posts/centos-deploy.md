Step 1、
连接： ssh username@ip

Step 2、
安装gcc: yum install gcc gcc-g++ openssl-devel

如果系统没有安装wget工具，可以通过yum -y install wget命令安装

Step 3、下载NodeJS源码包并解压。

    [root@BobServerStation local]# wget http://nodejs.org/dist/v0.10.24/node-v0.10.24.tar.gz
	[root@BobServerStation local]# tar zxvf node-v0.10.24.tar.gz
	[root@BobServerStation local]# cd node-v0.10.24

Step 4、配置、编译、安装。

    [root@BobServerStation node-v0.10.24]# ./configure --prefix=/usr/local/node
    [root@BobServerStation node-v0.10.24]# make && make install
    将持续3-4min....

Step 5、接下来配置Node环境

    [root@BobServerStation node-v0.10.24]# vim /etc/profile

    #set nodejs env
    export NODE_HOME=/usr/local/node
    export PATH=$NODE_HOME/bin:$PATH
    export NODE_PATH=$NODE_HOME/lib/node_modules:$PATH

    [root@BobServerStation node-v0.10.24]# source /etc/profile --重启生效

Step 6、测试是否安装成功

    [root@BobServerStation node-v0.10.24]# node -v
    v0.10.24
    
Step 7、部署OpenResty

	wget http://openresty.org/download/ngx_openresty-1.4.2.8.tar.gz
	..解压、cd到目录
	./configure --with-luajit --prefix=/usr/local/openresty
	make && make install
	
Step 8、配置nginx.conf

	nginx的配置主要由静态文件请求配置和路径匹配组成，路径匹配主要是通过正则匹配实现。OpenResty还可以通过lua脚本直接调用sql，以后有机会可以研究一下。（http默认端口80）
	
Step 9、负载均衡配置

	http {
  		upstream myproject {
    		server 127.0.0.1:8000 weight=5;
    		server 127.0.0.1:8001 weight=5;
    		server 127.0.0.1:8002 weight=5;
  		}
 
  		server {
    		listen 80;
    		server_name www.domain.com;
    		location / {
      			proxy_pass http://myproject;
    		}
  		}
	}
这是weight配置方式，nginx轮询几率和weight权重成正比。其他分配方式包括轮询（默认）、ip_hash等。[参考](http://lihuipeng007.blog.163.com/blog/static/12108438820108206101535/)

---

### linux下shell文件没有执行权限的解决方法：
当执行shell的时候，出现Permission denied的情况，说明此目录没有sh执行权限

	chmod u+x *.sh
	
可以在当前目录创建sh执行和增加sh文件权限,

具体命令：
chmod [-cfvR] [-help] [--version] mode file...

说明 : 

Linux/Unix 的档案调用权限分为三级 : 档案拥有者、群组、其他。利用 chmod 可以藉以控制档案如何被他人所调用。 

参数 : 

mode : 权限设定字串，格式如下 : [ugoa...][[+-=][rwxX]...][,...]，其中 

u 表示该档案的拥有者，g 表示与该档案的拥有者属于同一个群体(group)者，o 表示其他以外的人，a 表示这三者皆是。 

+表示增加权限、- 表示取消权限、= 表示唯一设定权限。 

r 表示可读取，w 表示可写入，x 表示可执行，X 表示只有当该档案是个子目录或者该档案已经被设定过为可执行。 

-c : 若该档案权限确实已经更改，才显示其更改动作 

-f : 若该档案权限无法被更改也不要显示错误讯息 


-v : 显示权限变更的详细资料 

-R : 对目前目录下的所有档案与子目录进行相同的权限变更(即以递回的方式逐个变更) 

--help : 显示辅助说明 

--version : 显示版本 
