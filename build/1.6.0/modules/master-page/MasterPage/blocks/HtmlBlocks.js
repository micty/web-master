
/**
* 
*/
define('MasterPage/HtmlBlocks', function (require, module, exports) {
    var $ = require('$');
    var $String = $.require('String');
    var Tasks = $.require('Tasks');

    var Path = require('Path');
    var Lines = require('Lines');
    var File = require('File');


    var BlockList = require('BlockList');
    var HtmlBlock = require('HtmlBlock');


    return exports = {

        /**
        * 
        */
        parse: function (meta) {
            //解析出来的新列表，尽量复用之前创建的实例。
            var file$block = meta.patterns$HtmlBlock;     //当前集合。
            var old$block = meta.old.patterns$HtmlBlock;  //旧集合。
            var news = [];  //需要新建的。
            var olds = [];  //可以复用的。

            var list = BlockList.parse(meta.lines, meta.tags.html);

            //console.log(list);

            list.forEach(function (item) {
                var file = item.patterns.join();    //把整个路径模式看作一个整体。
                var block = old$block[file];

                if (!block) {
                    news.push(item);
                    return;
                }

                item.isOld = true;
                olds.push(file);
                item.block = file$block[file] = block;

                //同一个路径模式对应的实例只能给复用一次。
                //如果后续再遇到相同的路径模式，则只能新建一个，
                //不过，这种情况在现实中几乎不可能出现，
                //因为同一个页面中出现多个完全相同的路径模式没任何意义。
                delete old$block[file];
            });


            //有可能同一个文件名给引用了多次，这里也对应为一个实例。
            news.forEach(function (item) {
                var file = item.patterns.join();
                var block = item.block = file$block[file];

                if (block) {
                    return;
                }

                block = new HtmlBlock({
                    'dir': meta.dir,
                    'patterns': item.patterns,
                    'excludes': meta.excludes['html'],
                    'delay': 0,
                });

                block.parse({
                    error: function (file) {
                        console.error('不存在 html 文件', file);
                        console.log('所在的 html 文件'.bgCyan, meta.file.cyan);

                        file = Path.relative(meta.dir, file);
                        BlockList.highlight(meta.lines, item, file);

                        throw new Error();
                    },
                });

                item.block = file$block[file] = block;
            });

            //释放备份中没有复用到的实例。
            Object.keys(old$block).forEach(function (file) {
                var block = old$block[file];
                delete old$block[file];

                if (!olds.includes(file)) {
                    block.destroy();
                }
            });

            return list;
        },



        /**
        * 
        */
        render: function (meta, done) {

            meta.HtmlBlocks.forEach(function (item) {

                var html = item.block.render({
                    'tabs': item.tabs,
                });

                Lines.replace(meta.lines, item.begin, item.end, html);
            });

            done();
        },

        /**
        *
        */
        watch: function (meta) {
            meta.HtmlBlocks.forEach(function (item) {
                if (item.isOld) { //复用过来的，不需要重新绑定。
                    return;
                }

                item.block.on('change', function () {
                    var html = this.render({
                        'tabs': item.tabs,
                    });

                    Lines.replace(meta.lines, item.begin, item.end, html);
                    meta.mix(true);
                });

                item.block.watch();

            });

        },
    };
    
});


