var fs = require('fs');
var ejs = require('ejs');
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
    this.post_ejs = fs.readFileSync('../posts/post.ejs', 'utf8');
    this.ejs_data.index = require('./main.json');
    this.ejs_data.posts = require('./posts.json');
    return this;
}

compile.prototype.render = function(){
    var self = this;
    this.ejs_data.posts.forEach(function(post){
        try {
            self.ejs_data.post = post;
            var MD = fs.readFileSync("../posts" + post.md_file, 'utf8');
            self.ejs_data.postHtml = markdown.render(MD);
            var compiledHtml = ejs.render(self.post_ejs, self.ejs_data);
            fs.writeFileSync("../static" + post.html_file, compiledHtml, 'utf8');
        }catch (error){
            throw error;
        }
    });
    console.log("post html created!");
}