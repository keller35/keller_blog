var fs = require('fs');
var ejs = require('ejs');
var path = require('path');
var hljs = require('highlight.js');
var markdown = require('markdown-it')({
    highlight: function (str, lang) {
        if (lang && hljs.getLanguage(lang)) {
            try {
                return hljs.highlight(lang, str).value;
            } catch (__) {}
        }

        try {
            return hljs.highlightAuto(str).value;
        } catch (__) {}

        return ''; // use external default escaping
    }
});

module.exports = compile;

function compile(){
}

compile.prototype.init = function(){
    this.ejs_data = {};
    this.links_ejs = fs.readFileSync(path.join(appDirname, 'posts/links.ejs'), 'utf8');
    this.ejs_data.index = require(path.join(appDirname, 'bin/main.json'));
    return this;
};

compile.prototype.render = function(){
    var compiledHtml = ejs.render(this.links_ejs, this.ejs_data);
    try {
        fs.writeFileSync(path.join(appDirname, 'static/links.html'), compiledHtml, 'utf8');
        console.log('links.html created!');
    }catch (error){
        throw error;
    }
};