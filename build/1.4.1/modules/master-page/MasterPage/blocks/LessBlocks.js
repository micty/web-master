﻿
/**
* 
*/
define('MasterPage/LessBlocks', function (require, module, exports) {
    var $ = require('$');
    var Tasks = $.require('Tasks');
    var Lines = require('Lines');
    var Path = require('Path');
    var BlockList = require('BlockList');
    var LessBlock = require('LessBlock');


    return exports = {

        /**
        * 
        */
        parse: function (meta) {
            //解析出来的新列表，尽量复用之前创建的实例。
            //使用复用旧实例的策略，主要是为了应付母版页本身的内容发生改变时，需要重新解析带来的性能问题。
            //母版页内容发生局部变化时，大多数标签不变，重新解析时可以复用之前创建的实例，从而提高性能。
            var file$block = meta.patterns$LessBlock;     //当前集合。
            var old$block = meta.old.patterns$LessBlock;  //旧集合。
            var news = [];  //需要新建的。
            var olds = [];  //可以复用的。

            var list = BlockList.parse(meta.lines, meta.tags.less);

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

                block = new LessBlock({
                    'patterns': item.patterns,
                    'excludes': meta.excludes['less'],
                    'dir': meta.dir,
                    'htdocs': meta.htdocs,
                    'css': meta.css,
                });


                block.parse({
                    error: function (file) {
                        console.log('不存在 less 文件'.bgRed, file.bgRed);
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
            var tasks = new Tasks(meta.LessBlocks);

            tasks.on('each', function (item, index, done) {
                item.block.compile({
                    'minify': false,
                    'concat': false,
                    'dest': {           //输出各个分目标文件。
                        each: true,
                    },           
                    'done': function () {
                        var html = this.render({
                            'tabs': item.tabs,
                            'inline': item.inline,
                            'props': {},
                        });

                        Lines.replace(meta.lines, item.begin, item.end, html);

                        done();
                    },
                });
            });

            tasks.on('all', function () {
                done();
            });

            tasks.parallel();
        },

        /**
        *
        */
        watch: function (meta) {

            meta.LessBlocks.forEach(function (item) {
                if (item.isOld) { //复用过来的，不需要重新绑定。
                    return;
                }

                item.block.on('change', function () {

                    this.compile({
                        'minify': false,
                        'concat': false,
                        'dest': {           //输出各个分目标文件。
                            each: true,
                        },           
                        'done': function () {
                            var html = this.render({
                                'tabs': item.tabs,
                                'inline': item.inline,
                                'props': {},
                            });

                            Lines.replace(meta.lines, item.begin, item.end, html);

                            meta.mix(500);
                        },
                    });
                });

                item.block.watch();

            });
           
        },



        /**
        * 构建。
        *   options = {
        *       minify: false,      //是否压缩。
        *       inline: false,      //是否内联。
        *       dest: '{md5}.css',  //输出的目标文件名。 支持 `{md5}` 模板字段。 
        *       props: {},          //输出到标签里的 html 属性。
        *       query: {},          //生成到 href 属性中的 query 部分。
        *   };
        */
        build: function (meta, options, done) {
            var tasks = new Tasks(meta.LessBlocks);

            tasks.on('each', function (item, index, done) {
                item.block.build({
                    'tabs': item.tabs,
                    'minify': options.minify,
                    'inline': options.inline,
                    'dest': options.dest,
                    'props': options.props,
                    'query': options.query,

                    'done': function (html) {
                        Lines.replace(meta.lines, item.begin, item.end, html);
                        done();
                    },
                });
            });

            tasks.on('all', function () {
                done();
            });

            tasks.parallel();
        },

    };
    
});


