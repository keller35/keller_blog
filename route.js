/**
 * Created by keller on 2015/4/25.
 */
var url = require('url');


module.exports = function(req, res, next){
    var path = url.parse(req.url).pathname;
    switch (path) {
        case '/':
            loadPage('index', res);
            break;
        default:
            loadPage(path, res);
    }
}
