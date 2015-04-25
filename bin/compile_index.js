var fs = require('fs');
var ejs = require('ejs');

module.exports = compile;

function compile(){
    this.ejs_data = {};
    this.index_ejs = fs.readFileSync('../static/index.ejs', 'utf8');
    this.ejs_data.index = require('./main.json');
    this.ejs_data.posts = require('./posts.json');
}

compile.prototype.init = function(){

    var compiledHtml = ejs.render(this.index_ejs, this.ejs_data);
    try {
        fs.writeFileSync('../static/index.html', compiledHtml, 'utf8');
        console.log('index.html created!');
    }catch (error){
        throw error;
    }
}