var fs = require('fs');
var ejs = require('ejs');
var path = require('path');

global.appDirname = path.join(__dirname, '../');

var compileIndex = require('./compile_index.js');
var compilePost = require('./compile_post.js');

function compile(){
    new compileIndex().init().render();
    new compilePost().init().render();
}

compile();