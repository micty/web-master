 
/**
* 
*/
define('WebSite/Masters', function (require, module, exports) {
    var $ = require('$');
    var Tasks = $.require('Tasks');
    var MasterPage = require('MasterPage');
    var Log = require('Log');
    var Watcher = require('Watcher');

    var MasterBlock = require('MasterBlock');

    var Files = module.require('Files');
    var JsBlock = module.require('JsBlock');
    var LessBlock = module.require('LessBlock');





    return {

        /**
        * 解析。
        *   config = {
        *       excludes: {
        *           less: [],
        *           html: [],
        *           js: [],
        *       },
        *   };
        */
        parse: function (meta, config) {
            var options = meta.masters;

            if (!options) {
                return null;
            }


            var block = new MasterBlock({
                'htdocs': meta.cwd,
                'css': meta.css,

                'patterns': options.patterns,
                'dest': options.dest,

                'excludes': config.excludes,
            });

            var files = block.parse();
            var count = files.length;

            if (count > 0) {
                console.log('匹配到'.bgGreen, count.toString().cyan, '个母版页:');
                Log.logArray(files, 'green');
            }

            return block;
        },

        /**
        * 编译。
        */
        compile: function (meta, options, done) {
            var block = meta.MasterBlock;

            if (!block) {
                return done();
            }


            var minify = options.minify;

            block.compile({
                'minify': minify,
                'done': function () {
                    done();
                },
            });
        },

        /**
        * 编译所有母版页，完成后开启监控。
        *   config = {
        *       options: {
        *           minify: false,      //是否压缩。
        *       },
        *       done: fn,               //编译及监控完成后要执行的回调函数。
        *   };
        */
        watch: function (meta, config) {
            var block = meta.MasterBlock;
            var options = config.options;
            var done = config.done;

            if (!block || !options) {
                return done();
            }


            block.on('change', function () {
                this.compile({
                    'minify': options.minify,
                    'done': function () {
                        Watcher.log();
                    },
                });
            });

            block.on('compile', 'each', {
                'before': function (item) {
                    Log.seperate();
                    console.log('>> 开始编译'.cyan, item.file);
                },

                'done': function (item) {
                    console.log('<< 完成编译'.green, item.file);
                },
            });

            block.compile({
                'minify': options.minify,
                'done': function () {
                    console.log('准备开始监控，请稍候...');
                    block.watch();      //开启监控。
                    done();
                },
            });

        },




        /**
        * 构建所有母版页。
        *   config = {
        *       options: {
        *           lessLink: {},
        *           lessBlock: {},  
        *           jsBlock: {},
        *           html: {},
        *       },
        *       done: fn,               //编译及监控完成后要执行的回调函数。
        *   };
        */
        build: function (meta, config) {
            var block = meta.MasterBlock;
            var options = config.options;
            var done = config.done;

            if (!block || !options) {
                return done();
            }


            var cwd = meta.cwd;
            var lessBlock = LessBlock.normalize(meta, options.lessBlock);
            var jsBlock = JsBlock.normalize(cwd, options.jsBlock);


            block.on('build', 'each', {
                'before': function (item) {
                    Log.seperate();
                    console.log('>> 开始构建'.cyan, item.file);
                },

                'done': function (item) {
                    console.log('<< 完成构建'.green, item.file);
                },
            });

            block.on('build', 'all', function () {
                done(); //完成当前任务。
            });

            block.build({
                'lessLink': options.lessLink,
                'lessBlock': lessBlock,
                'jsBlock': jsBlock,
                'html': options.html,
            });

        },


    };




});




