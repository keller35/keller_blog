今天申请了域名，通过对域名的配置，顺便了解了一下cdn的配置和工作原理。

因为博客部署在heroku上，所以原本已经有了一个域名：kellerblog.heroku.com，是在heroku创建应用时生成的域名。这个自己申请的域名是www.kellerblog.cc，所以要在cdn上将两个域名绑定，访问后者就会映射到前者。

cdn映射一般有一下几种情况：

* A记录解析：就是将域名映射到ip上
* CNAME解析：这次我配置的就是CNAME解析，就是将域名映射到域名上
* MX记录解析：作为邮箱解析使用，指向的是邮箱地址服务器地址

cdn还有TTL设置，TTL的单位是秒，通常不小于200s，TTL(Time-To-Live)，就是一条域名解析记录在DNS服务器中的存留时间。当各地的DNS服务器接受到解析请求时，就会向域名指定的NS服务器发出解析请求从而获得解析记录；在获得这个记录之后，记录会在DNS服务器中保存一段时间，这段时间内如果再接到这个域名的解析请求，DNS服务器将不再向NS服务器发出请求，而是直接返回刚才获得的记录；而这个记录在DNS服务器上保留的时间，就是TTL值。

然而在配置的时候出现了一些问题，我配置了www.kellerblog.cc到kellerblog.heroku.com域名的映射之后，使用`host www.kellerblog.com`命令查看主机名，发现映射地址是正确的，但是查看网页，访问到的地址确实是heroku，但heroku却提示app not found。

后来查看[文档](https://devcenter.heroku.com/articles/custom-domains)，发现heroku内部还需要做一步操作，需要通过`heroku domains:add www.kellerblog.cc`添加域名，这里似乎是heroku内部的DNS操作。

完成这些，于是终于可以用上自己的域名啦!