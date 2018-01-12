
/**
* 
*/
define('MasterPage/JsLinks', function (require, module, exports) {
    var $ = require('$');
    var Tasks = $.require('Tasks');
    var JsLink = require('JsLink');
    var File = require('File');
    var Lines = require('Lines');



    return exports = {

        /**
        * 
        */
        parse: function (meta) {

            //解析出来的新列表，尽量复用之前创建的实例。
            var file$link = meta.js$link;     //当前集合。
            var old$link = meta.old.js$link;  //旧集合。
            var news = [];  //需要新建的。
            var olds = [];  //可以复用的。

            var list = JsLink.parse(meta.content, {
                'dir': meta.dir,
            });


            list.forEach(function (item) {
              
                var file = item.file;
                var link = old$link[file];

                if (!link) {
                    news.push(item);
                    return;
                }

                item.isOld = true;
                olds.push(file);
                item.link = file$link[file] = link;

                //同一个路径对应的实例只能给复用一次。
                //如果后续再遇到相同的路径，则只能新建一个，
                //不过，这种情况在现实中几乎不可能出现，
                //因为同一个页面中出现多个完全相同的路径没任何意义。
                delete old$link[file];
            });


            //有可能同一个文件名给引用了多次，这里也对应为一个实例。
            news.forEach(function (item) {
                var file = item.file;
                var existed = item.external || File.exists(file); //内部资源时，检查文件是否存在。

                if (!existed) {
                    console.log('不存在 js 文件'.bgRed, file.bgRed);
                    console.log('所在的 html 文件'.bgCyan, meta.file.cyan);
                    Lines.highlight(meta.lines, item.no);
                    throw new Error();
                }


                var link = file$link[file] || new JsLink({
                    'file': item.file,
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


        /**
        *
        */
        watch: function (meta) {
            meta.JsLinks.forEach(function (item) {
                if (item.isOld) { //复用过来的，不需要重新绑定。
                    return;
                }

                item.link.on('change', function () {
                    var html = item.link.render({
                        'inline': item.inline,
                        'tabs': item.tabs,
                        'href': item.href,
                        'md5': 4,
                        'props': item.props,
                        'query': {},
                    });

                    if (html == item.output) {
                        return;
                    }

                    item.output = html;
                    meta.lines[item.no] = html;
                    meta.mix(500);
                });

                item.link.watch();

            });
        },

        /**
        *
        */
        render: function (meta, done) {
            meta.JsLinks.forEach(function (item) {
                var html = item.link.render({
                    'inline': item.inline,
                    'tabs': item.tabs,
                    'href': item.href,
                    'md5': 4,
                    'props': item.props,
                    'query': {},
                });

                item.output = html;
                meta.lines[item.no] = html;
            });

            done();

        },

        /**
        * 构建。
        */
        build: function (meta, done) {

            Tasks.parallel({
                'list': meta.JsLinks,

                'each': function (item, index, done) {
                    //静态方法。
                    JsLink.build(item, function (html) {
                        item.output = html;
                        meta.lines[item.no] = html;
                        done();
                    });
                },

                'all': done,
            });

        },



    };
    
});


