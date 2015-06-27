var fs = require('fs');
var ejs = require('ejs');
var path = require('path');

module.exports = compile;

function compile(){
}

compile.prototype.init = function(){
    this.ejs_data = {};
    this.index_ejs = fs.readFileSync(path.join(appDirname, 'posts/index.ejs'), 'utf8');
    this.ejs_data.index = require(path.join(appDirname, 'bin/main.json'));
    this.ejs_data.posts = require(path.join(appDirname, 'bin/posts.json'));
    return this;
}

compile.prototype.render = function(){
    var compiledHtml = ejs.render(this.index_ejs, this.ejs_data);
    try {
        fs.writeFileSync(path.join(appDirname, 'static/index.html'), compiledHtml, 'utf8');
        console.log('index.html created!');
    }catch (error){
        throw error;
    }
}