[Docker](https://www.docker.com/)是开源的容器引擎，开发者可以将自己的应用和应用的依赖环境打包到docker中，作为一个可移植的容器。
利用这个容器，可以实现非常简单的移植部署，保证开发、测试和生产环境的一致性。

最近需要将公司的服务docker化，所以这里记录一下此次的部署过程。

## 安装docker

docker的安装对操作系统有一定的要求，具体可见[文档](https://docs.docker.com/engine/installation/)。
这里以我使用的Ubuntu为例，docker要求系统必须是64位，内核版本不低于3.10。有关内核版本可以通过`uname -a`查看。

    Linux iZ288jjee7mZ 3.13.0-32-generic #57-Ubuntu SMP Tue Jul 15 03:51:08 UTC 2014 x86_64 x86_64 x86_64 GNU/Linux
    
docker安装：

    $ curl -sSL https://get.docker.com/ | sh
    
docker是c/s模式的程序，客户端和守护进程可以进行通信，守护进程负责处理任务。

通过查看版本信息，确认docker安装成功
    
    $ sudo docker version
    
## 应用镜像创建

我的应用架构如下：

    nginx：
    
        监听80端口，作为对外的唯一访问入口，实现对api访问的负载均衡
    
    node：
    
        提供RESTful api，利用redis进行数据缓存，利用mongo进行数据存储；
    
    redis：
    
        实现数据缓存
    
    mongo：
    
        实现数据存储
    
对于以上架构，需要创建四个镜像，即nginx镜像、api镜像、redis镜像和mongo镜像。

首先从底层数据存储层开始，因为redis和mongo只对外提供服务，如果不需要修改他们的默认配置的情况下，直接使用registry中现有的镜像即可满足我的要求
（docker hub因为墙的原因，访问很慢，所以这里使用国内服务商提供的镜像）。

redis：

    docker pull daocloud.io/daocloud/dao-redis:master-init
    
mongo:

    docker pull daocloud.io/library/mongo:latest
    
接下来是api镜像，这个镜像的基础环境是node镜像，同时还需要在容器中挂载我的源代码（这里没有在镜像中ADD源代码，是因为在后面，将会在启动容器时进行文件挂载），
导出端口，最后启动node进程，所以这里使用Dockerfile来描述镜像：

    FROM daocloud.io/library/node:latest
    EXPOSE 5000
    CMD ["node", "/usr/local/api/app"]

在当前上下文环境创建镜像：
    
    docker build -t keller35/api:init .
    
在创建nginx镜像之前，首先需要设置自己的nginx配置如下：

    upstream api-cluster {
        server api1:5000 weight=5;
        server api2:5000 weight=5;
        server api3:5000 weight=5;
    }

    server {
    
        listen 80 default_server;
        server_name 127.0.0.1;
    
        location / {
            root         /usr/local/api;
            index        index.html;
        }
    
        location /api {
            client_max_body_size   200M;
            keepalive_timeout    1800;
            proxy_pass http://api-cluster;
            proxy_set_header Host $host;
            proxy_set_header X-Real-Ip $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        }
    }
    
将以上保存为文件`api.conf`，nginx镜像的Dockerfile如下：

    FROM index.alauda.cn/library/nginx
    COPY api.conf /etc/nginx/conf.d/api.conf
    
然后执行
    
    docker build -t keller35/nginx:init .
    
就会将自定义的nginx配置文件copy到nginx镜像中，所以nginx启动时将会加载自定义的配置。

## 启动容器

各个容器之间通过docker提供的内部`link system`互相连接，通过link连接的容器内部有关于连接信息的环境变量，例如通过`--link redis:redis`将node容器连接至redis容器，
那么在node容器中可以通过`REDIS_PORT_6379_TCP_ADDR`和`REDIS_PORT_6379_TCP_PORT`两个环境变量获取redis的连接地址，这样就可以在node避免了硬编码。

容器启动：

    # redis
    docker run --name redis -d daocloud.io/daocloud/dao-redis:master-init
    
    # mongo
    docker run --name mongo -v /data/db:/data/db -d daocloud.io/library/mongo:latest
    
    # api1
    # api2、api3容器的启动方式相同
    docker run --name api1 -d \
    -v /usr/local/api:/usr/local/api \
    --link redis:redis \
    --link mongo:mongo \
    keller35/api:init
    
    # nginx
    docker run --name nginx -p 80:80 \
    --link api1:api1 \
    --link api2:api2 \
    --link api3:api3 \
    -d keller35/nginx:init
    
查看容器情况：

    docker ps
    
测试：

    curl http://127.0.0.1/api/xxxx
 
如果调用Restful api成功，说明容器启动成功。也可以执行容器内部bash：

    docker exec -i -t redis bash
    
## 总结

个人感觉通过docker部署有几个优势：

1、可以保证从开发、测试到生产的环境相同，只要从开发开始维护镜像，那么就能保证测试和最终的生产环境跟开发环境一致，而且基于docker的部署非常简单，大大减少了部署的工作量；

2、部署的版本控制，通过对镜像tag的管理可以实现对部署版本的管理；

3、水平扩展，利用docker容器的隔离，可以很快实现无状态应用的水平扩展。