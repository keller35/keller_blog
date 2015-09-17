var path = require('path');

global.appDirname = path.join(__dirname, '../');

var compileIndex = require('./compile_index.js');
var compilePost = require('./compile_post.js');
var compileLinks = require('./compile_links.js');

function compile(){
    new compileIndex().init().render();
    new compilePost().init().render();
    new compileLinks().init().render();
}

exports.compile = compile;