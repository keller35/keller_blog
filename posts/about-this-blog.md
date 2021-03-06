一直都想搭一个自己的博客，但是苦于没有行动。这次终于下定决心，动起手来，搭了一个简单的个人博客。

#### 关于博客

博客主要是用Node.js写的纯静态博客。实现方法是：博文先用markdown写好，经过ejs模板渲染生成html，再嵌入到整体html框架中，生成静态文件。客户端直接请求静态文件即可。因为个人博客更新频率必定不会很高，我用st在服务端做了静态文件缓存，也在客户端做了缓存策略。关于st模块，可以参考[st module](https://www.npmjs.com/package/st)。

博客代码存放于[github](https://github.com/keller35/keller_blog)。

#### 关于部署

工程部署在[heroku](https://www.heroku.com/)上，之所以选择heroku，一个原因是heroku是免费的，另一个原因是heroku可以直接支持node，不需要部署node环境。同时，heroku部署还可以通过git直接部署工程，部署非常简单。不过也有缺点就是中国的访问速度通常会比较慢。下面记录一下我的部署过程。

要使用heroku服务，需要先在heroku注册。

部署的时候需要下载heroku提供的Heroku Toolbelt工具，通过命令登陆。

    heroku login

cd到自己本地的git仓库，通过以下命令，创建heroku app，其实就是建立master与heroku远程git仓库的绑定关系。

    heroku create

推送master至heroku，这样就完成了工程的部署。

    git push heroku master

要启动工程，还需要在工程目录下新建一个`Procfile`文件，文件内容为`web: node index.js`,可以看到这是app的启动命令，如果需要可以用`-p $PORT`来设定端口，heroku默认端口是5000，代码里端口变量可以从process.env.PORT获取，heroku固定查找这个文件然后执行其中的命令。

按照官方文档的提示，启动app需要`heroku ps:scale web=1`命令（暂时不明白这个指令的作用，貌似是heroku提供部署多个工程的机制，所以这里可以进行指定，以后使用到了再进行研究）。

要访问自己的工程，可以在toolbelt里通过`heroku open`直接打开浏览器，也可以在登陆heroku官网，在Dashboard查看自己工程的访问地址。

查看日志命令是`heroku logs`,查看进程命令是`heroku ps`。