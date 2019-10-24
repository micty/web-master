
/**
* 
*/
define('MasterPage/JsBlocks', function (require, module, exports) {
    var $ = require('$');
    var Tasks = $.require('Tasks');
    var Lines = require('Lines');
    var BlockList = require('BlockList');
    var JsBlock = require('JsBlock');
    var Path = require('Path');


    return exports = {

        /**
        * 
        */
        parse: function (meta) {
            //解析出来的新列表，尽量复用之前创建的实例。
            var file$block = meta.patterns$JsBlock;     //当前集合。
            var old$block = meta.old.patterns$JsBlock;  //旧集合。
            var news = [];  //需要新建的。
            var olds = [];  //可以复用的。

            var list = BlockList.parse(meta.lines, meta.tags.js);

            list.forEach(function (item) {
                var file = item.patterns.join();    //把整个路径模式看作一个整体。
                var block = old$block[file];

                if (!block) {
                    news.push(item);
                    return;
                }

                olds.push(file);
                item.isOld = true;                  //新增字段
                item.block = file$block[file] = block; //新增字段

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

                block = new JsBlock({
                    'dir': meta.dir,
                    'patterns': item.patterns,
                    'excludes': meta.excludes['js'],
                    'delay': 0,
                });


                //转发事件。
                block.on({
                    'render': {
                        'js-link': function () {
                            var args = [...arguments];
                            var values = meta.emitter.fire('render', 'js-link', args);
                            return values.slice(-1)[0];
                        },
                    },
                });


                block.parse({
                    error: function (file) {
                        console.error('不存在 js 文件', file);
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
            meta.JsBlocks.forEach(function (item) {

                var html = item.block.render({
                    'tabs': item.tabs,
                    'md5': 4,
                });

                Lines.replace(meta.lines, item.begin, item.end, html);

            });

            done();
        },


        /**
        *
        */
        watch: function (meta) {

            meta.JsBlocks.forEach(function (item) {
                if (item.isOld) { //复用过来的，不需要重新绑定。
                    return;
                }

                item.block.on('change', function () {

                    var html = this.render({
                        'tabs': item.tabs,
                        'md5': 4,
                    });

                    Lines.replace(meta.lines, item.begin, item.end, html);

                    meta.mix(true);

                });

                item.block.watch();

            });

        },


        /**
        * 构建。
        *   options = {
        *       begin: '',          //闭包的头片段文件路径。
        *       end: '',            //闭包的尾片段文件路径。
        *       minify: false,      //是否压缩。
        *       inline: false,      //是否内联。
        *       name: '{md5}'.js,   //输出的目标文件路径，支持 `{md5}` 模板字段。 目录为当前页面所在的目录。
        *       props: {},          //生成到标签里的其它属性。
        *       query: {},          //生成标签 src 属性里的 query 部分。 
        *       transform: fn,      //可选。 合并完成后、压缩之前，要对 js 内容进行转码的函数(如 babel 转码)。
        *   };
        */
        build: function (meta, options, done) {

            meta.JsBlocks.forEach(function (item) {

                var html = item.block.build({
                    'tabs': item.tabs,

                    'begin': options.begin,
                    'end': options.end,
                    'minify': options.minify,
                    'inline': options.inline,
                    'name': options.name,
                    'props': options.props,
                    'query': options.query,
                    'transform': options.transform,
                });

                Lines.replace(meta.lines, item.begin, item.end, html);

            });

            done();
        },
    };
    
});


