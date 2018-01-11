
/**
* 
*/
define('LessBlock/Parser', function (require, module, exports) {
    var $ = require('$');
    var Patterns = require('Patterns');
    var File = require('File');
    var LessLink = require('LessLink');



    return {


        /**
        * 解析。
        *   options = {
        *       error: function(file),  //文件不存在时的回调函数。
        *   };
        */
        parse: function (meta, options) {
            options = options || {};
            var error = options.error;

            //解析出来的新列表，尽量复用之前创建的实例。
            var file$link = meta.file$link;     //当前集合。
            var old$link = meta.old.file$link;  //旧集合。
            var news = [];  //需要新建的。
            var olds = [];  //可以复用的。

            var files = Patterns.getFiles(meta.patterns, meta.excludes);    //做减法。

            var list = files.map(function (file) {

                var dest = LessLink.get({
                    'htdocs': meta.htdocs,
                    'dir': meta.dir,
                    'css': meta.css,
                    'file': file,
                });


                return {
                    'file': file,
                    'dest': dest,
                    'link': null,
                    'isOld': false,
                };
            });


            list.forEach(function (item) {
                var file = item.file;
                var link = old$link[file];

                //旧列表中还没有，则添加到待新建的集合中。
                if (!link) {
                    news.push(item);
                    return;
                }

                console.log('复用'.bgGreen, file.gray);

                olds.push(file);
                item.isOld = true;
                item.link = file$link[file] = link;
            });


            //有可能同一个文件名给引用了多次，这里也对应为一个实例。
            news.forEach(function (item) {
                var file = item.file;

                if (!File.exists(file)) {
                    error && error(file);
                    return;
                }

                var link = file$link[file] || new LessLink({
                    'file': file,
                });

                item.link = file$link[file] = link;
            });

            //释放备份中没有复用到的实例。
            Object.keys(old$link).forEach(function (file) {
                var link = old$link[file];
                delete old$link[file];

                if (!olds.includes(file)) {
                    link.destroy();
                }
            });

            return list;

        },
    };
    
});


