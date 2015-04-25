var fs = require('fs');
var ejs = require('ejs');
var compileIndex = require('./compile_index.js');
function compile(){
    new compileIndex().init();
}
compile();