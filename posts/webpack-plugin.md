记一次webpack plugin的改造

webpack的强大功能在于模块化，这里的模块化不仅包括js的模块化，还包括css、图片等所有文件的模块化，也就是理论上所有文件组织形式的文件都可以在webpack中被当做模块使用。
而实现模块化功能的就是webpack中的`loader`，它被用于指定当webpack加载模块时的操作。
webpack另外一个强大的地方就是定制化，webpack提供了在整个生命周期中的各种hook给，开发者通过这些hook控制webpack生命周期中的模块化结果，从而定制化自己所需要的操作。
`plugin`就是这个定制化的称呼。

webpack提供了内置的`UglifyJsPlugin`用于在模块化结果上对js文件进行uglify，但是我们在小组内部使用过后发现，`UglifyJsPlugin`操作的时间很长，所以我们小组在以下两个方面对它进行了优化：
1、增加多进程任务
2、uglify缓存

下面详细描述这两块的代码：

1、多进程任务

因为`UglifyJsPlugin`本身只支持单进程的工作方式，所以我们考虑将原本在单进程中串行执行的任务分发到并行执行的多进程中去，从而提高整体的uglify效率。
所以，首先将通用的uglify任务代码放到worker.js文件中，作为单一进程的任务。
大致代码如下:
```
var uglify = require("uglify-js");
var SourceMapConsumer = require("webpack-core/lib/source-map").SourceMapConsumer;

process.on('message', function (m) {
    if (m.cmd == 'uglify') {
        try {
            doUglify(m.task);
        } catch (e) {
            process.send({
                cmd: 'error',
                err: e,
                file: m.task.file
            });
        }
    }
});

function doUglify(task) {
    var oldWarnFunction = uglify.AST_Node.warn_function;
    var options = task.options;
    if (options.sourceMap) {
        var sourceMap = new SourceMapConsumer(task.inputSourceMap);
        uglify.AST_Node.warn_function = function (warning) { // eslint-disable-line camelcase
            var match = /\[.+:([0-9]+),([0-9]+)\]/.exec(warning);
            var line = +match[1];
            var column = +match[2];
            var original = sourceMap.originalPositionFor({
                line: line,
                column: column
            });
            if (!original || !original.source || original.source === task.file) return;
            process.send({
                cmd: 'warning',
                msg: warning.replace(/\[.+:([0-9]+),([0-9]+)\]/, "") +
                "[" + original.source + ":" + original.line + "," + original.column + "]"
            });
        };
    } else {
        uglify.AST_Node.warn_function = function (warning) { // eslint-disable-line camelcase
            process.send({
                cmd: 'warning', msg: warning
            });
        };
    }
    uglify.base54.reset();
    var ast = uglify.parse(task.input, {
        filename: task.file
    });
    if (options.compress !== false) {
        ast.figure_out_scope();
        var compress = uglify.Compressor(options.compress); // eslint-disable-line new-cap
        ast = ast.transform(compress);
    }
    if (options.mangle !== false) {
        ast.figure_out_scope();
        ast.compute_char_frequency(options.mangle || {});
        ast.mangle_names(options.mangle || {});
        if (options.mangle && options.mangle.props) {
            uglify.mangle_properties(ast, options.mangle.props);
        }
    }
    var output = {};
    output.comments = Object.prototype.hasOwnProperty.call(options, "comments") ? options.comments : /^\**!|@preserve|@license/;
    output.beautify = options.beautify;
    for (var k in options.output) {
        output[k] = options.output[k];
    }
    if (options.sourceMap !== false) {
        var map = uglify.SourceMap({ // eslint-disable-line new-cap
            file: task.file,
            root: ""
        });
        output.source_map = map; // eslint-disable-line camelcase
    }
    var stream = uglify.OutputStream(output); // eslint-disable-line new-cap
    ast.print(stream);
    if (map) map = map + "";
    stream = stream + "";
    uglify.AST_Node.warn_function = oldWarnFunction;
    process.send({
        cmd: 'complete',
        result: {map: map, stream: stream, file: task.file, pid: process.pid},
        time: Date.now()
    })
}
```

这里的大部分代码是直接从原来的`UglifyJsPlugin`中copy来的（都是对`uglify-js`模块的使用，比如语法树什么的，其实具体原理我也不懂，但是不妨碍我们的改造），
而我们新增的代码主要是worker进程和主进程之间的通信，用于控制worker进程任务的开始和任务失败或者完成后对主进程的通知。

主进程代码在FastUglifyJsPlugin.js中，其中主要代码如下：

```
if (tasks.length) {
    var workerNum = options.workerNum || os.cpus().length;
    totalNum = tasks.length;
    while (workerNum > 0) {
        workerNum--;
        var worker = fork(path.join(__dirname, 'worker.js'));
        idleWorkers.push(worker);
        //主进程收到子进程的信息
        worker.on('message', function (m) {
            if (m.cmd === 'complete') {
                var result = m.result;
                var file = result.file;
                var task = cbs[file];
                var asset = compilation.assets[file];
                asset.__UglifyJsPlugin = compilation.assets[file] = (result.map ?
                    new SourceMapSource(result.stream, file, JSON.parse(result.map), task.input, task.inputSourceMap) :
                    new RawSource(result.stream));
                if (isCache) {
                    // 记录cache
                    var fileHash = genHash(task.input);
                    var sourceName = file.replace(compilation.hash, '').slice(0, -3);
                    var name = sourceName + '.' + fileHash + '.js';
                    uglifyCache.setCacheContent(sourceName, name, asset.__UglifyJsPlugin._value);
                }
                completeNum++;
                var arr = busyWorkers.filter(function (worker) {
                    return worker.pid == result.pid;
                });
                // move worker from busy to idle
                if (arr.length) {
                    var index = busyWorkers.indexOf(arr[0]);
                    busyWorkers.splice(index, 1);
                    idleWorkers.push(arr[0]);
                }
                // all complete and callback
                if (completeNum === totalNum) {
                    if (isCache) {
                        log('changedChunks: ' + chalk.red.bold(changedChunks.length) + '\n' + chalk.green(changedChunks.join('\n')));
                        log('unChangedChunks: '+ chalk.red.bold(unChangedChunks.length) + '\n' + chalk.green(unChangedChunks.join('\n')));
                    }
                    if (warnings.length > 0) {
                        compilation.warnings.push(new Error(file + " from UglifyJs\n" + warnings.join("\n")));
                    }
                    killWorkers();
                    callback();
                } else {
                    startNext();
                }

            } else if (m.cmd === 'warning') {
                warnings.push(m.msg);
            } else if (m.cmd === 'error') {
                var err = m.err || {};
                if (err.msg) {
                    compilation.errors.push(new Error(m.file + " from UglifyJs\n" + err.msg));
                } else {
                    compilation.errors.push(new Error(m.file + " from UglifyJs\n" + err.stack));
                }
                killWorkers();
                callback();
            }
        });
    }
    process.on('exit', killWorkers);
    startNext();
}
```

主进程控制任务分发到worker进程中，在任务多于worker进程的情况下，会等待worker进程的完成通知之后，再分发下一个任务，直到完成所有任务。

2、uglify缓存

另一个重要的优化点就是，当文件未修改的情况下，其实是可以直接使用上一次uglify的结果的，
所以我们加入了一个缓存目录(默认项目根目录下的.uglify)，当文件hash值未变化时，直接读取缓存目录的结果。
大致代码如下：

```
if (isCache) {
    if(uglifyCache.isContainCache(curFile)) {
        var cachedContent = uglifyCache.getCacheContent(curFile);
        compilation.assets[file] = new RawSource(cachedContent);
        // 记录未变化chunk
        unChangedChunks.push(file);
        return;
    }
    // 记录变化chunks
    changedChunks.push(file);
}
```