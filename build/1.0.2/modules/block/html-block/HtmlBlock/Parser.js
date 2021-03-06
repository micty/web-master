﻿
/**
* 
*/
define('HtmlBlock/Parser', function (require, module, exports) {

    var $ = require('$');
    var Patterns = require('Patterns');
    var HtmlLink = require('HtmlLink');



    return {


        /**
        * 
        */
        parse: function (meta) {
            //解析出来的新列表，尽量复用之前创建的实例。
            var file$link = meta.file$link;     //当前集合。
            var old$link = meta.old.file$link;  //旧集合。
            var news = [];  //需要新建的。
            var olds = [];  //可以复用的。

            var files = Patterns.getFiles(meta.patterns, meta.excludes);    //做减法。

            var list = files.map(function (file) {
                return {
                    'file': file,
                    'link': null,
                    'isOld': false,
                };
            });


            list.forEach(function (item) {
                var file = item.file;
                var link = old$link[file];

                if (!link) {
                    news.push(item);
                    return;
                }

                console.log('复用'.bgGreen, file.gray);

                item.isOld = true;
                olds.push(file);
                item.link = file$link[file] = link;
            });


            //有可能同一个文件名给引用了多次，这里也对应为一个实例。
            news.forEach(function (item) {
                var file = item.file;
                var link = file$link[file] || new HtmlLink({
                    'file': file,
                });

                link.parse();
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


