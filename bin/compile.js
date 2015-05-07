var fs = require('fs');
var ejs = require('ejs');
var compileIndex = require('./compile_index.js');
var compilePost = require('./compile_post.js');

function compile(){
    new compileIndex().init().render();
    new compilePost().init().render();
}

compile();