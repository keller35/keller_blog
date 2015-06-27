var http = require('http');
var connect = require('connect');
var st = require('st');

global.appDirname = __dirname;

var PORT = process.env.PORT || 5000;

var mount = st({
    path: appDirname + "/static",
    url: "/",
    cache: { // specify cache:false to turn off caching entirely
        fd: {
            max: 1000, // number of fd's to hang on to
            maxAge: 1000 * 60 * 60 // amount of ms before fd's expire
        },

        stat: {
            max: 5000, // number of stat objects to hang on to
            maxAge: 1000 * 60 // number of ms that stats are good for
        },

        content: {
            max: 1024 * 1024 * 64, // how much memory to use on caching contents
            maxAge: 1000 * 60 * 60 * 2,    // set 2 hours to cache contents
            cacheControl: 'public, max-age=600' // to set an explicit cache-control
                                                // header value
        },

        index: { // irrelevant if not using index:true
            max: 1024 * 8, // how many bytes of autoindex html to cache
            maxAge: 1000 * 60 * 10 // how long to store it for
        },

        readdir: { // irrelevant if not using index:true
            max: 1000, // how many dir entries to cache
            maxAge: 1000 * 60 * 10 // how long to cache them for
        }
    },

    index: 'index.html',
    dot: true,
    passthrough: false,
    gzip: true
});

var app = connect()
    .use(mount)
    .use(function(err, req, res, next){
        if(err){
            res.writeHead(500);
            res.end('server is in error');
        }
    });
http.createServer(app)
    .listen(PORT, function(){
        console.log("server listen on " + PORT);
    });