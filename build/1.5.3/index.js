
//var $ = require('./f/defineJS');
var $ = require('defineJS');
var Args = require('./args');
var _require = require;             //node.js 原生的 require，备份一下。


module.exports = {
    /**
    * 解析和获取命令行 `node watch` 或 `node build` 后面的参数。
    * 参数：
    *   type: 'watch' | 'build',
    * 返回：
    *   args = {
    *       pack: false,    //是否使用了 `pack` 选项。　如果是则使用独立打包的方式。
    *       action: '',     //编译完成后要执行的动作。 如 `open` 或 `qr`。
    *       value: '',      //要传递给 action 的值。 如 `localhost`、`450`。
    *   };
    */
    getArgs: function (type) {

        switch (type) {
            case 'watch':
                return Args.watch();

            case 'build':
                return Args.build();

            default:
                console.log('无法识别的参数 type 值: '.red, type);
                throw new Error();
        }
    },

    /**
    * 启动程序。
    * 参数：
    *   factory: fn,    //工厂函数。
    */
    launch: function (factory) {
        $.config({
            'base': __dirname,
            'modules': [
                'lib/',
                'modules/',
            ],
        });

        $.launch(function (require, module, exports) {
            var Console = require('Console');
            console.log = Console.log;

            Console.config({
                file: 'console.log',
                timestamp: true,
            });

            factory && factory(require, module, exports);

        });
    },


    /**
    * 启动和初始化程序，创建一个网站实例。
    * 参数：
    *   defaults: {},
    *   done: fn,
    */
    create: function (defaults, done) {
        var begin = new Date();

        module.exports.launch(function (require, module, exports) {
            var $ = require('$');
            var Emitter = $.require('Emitter');
            var WebSite = require('WebSite');
            var MasterPage = require('MasterPage');
            var Console = require('Console');
            var Watcher = require('Watcher');
            var Css = require('Css');
            var Js = require('Js');

            var emitter = new Emitter();
            var website = new WebSite(defaults);
            var templates = defaults.templates || {};
            var tags = defaults.tags;


            //设置相应模块的默认配置。
            Console.config(defaults.console);
            Watcher.config(defaults.watcher);

            if (tags) {
                MasterPage.config({ 'tags': tags, });
            }

            if (templates['css']) {
                Css.config({ 'sample': templates['css'], });
            }

            if (templates['js']) {
                Js.config({ 'sample': templates['js'], });
            }

            

            done(require, module, {
                'website': website,
                'begin': begin,
                'emitter': emitter,
            });

        });
    },


    /**
    * 使用常规方式进行编译和监控。
    * 参数：
    *   config = {
    *       args: {},
    *       defaults: {},
    *       options: {},
    *       done: fn,
    *   };
    */
    watch: function (config) {
        var args = config.args;
        var defaults = config.defaults;
        var options = config.options;
        var done = config.done;

        module.exports.create(defaults, function (require, mocule, exports) {
            var emitter = exports.emitter;
            var website = exports.website;
            var begin = exports.begin;

            //监控完成后。
            website.on('watch', function () {
                var time = new Date() - begin;
                console.log('耗时'.bgGreen, time.toString().cyan, 'ms');


                emitter.on({
                    'open': function (host) {
                        if (host == '.') { //提供快捷方式。
                            host = 'localhost';
                        }

                        website.open({ 'host': host, });
                    },

                    'qr': function (width) {
                        website.openQR({ 'width': width, });
                    },
                });

                emitter.fire(args.action, [args.value]);
                done && done(require, mocule, exports);
            });

            //开启监控。
            website.watch(options);
        });
    },

    /**
    * 使用常规方式进行构建。
    * 参数：
    *   config = {
    *       args: {},
    *       defaults: {},
    *       options: {},
    *       done: fn,
    *   };
    */
    build: function (config) {
        var args = config.args;
        var defaults = config.defaults;
        var options = config.options;
        var done = config.done;


        module.exports.create(defaults, function (require, module, exports) {
            var emitter = exports.emitter;
            var website = exports.website;
            var begin = exports.begin;

            //构建完成后。
            website.on('build', function () {
                var time = new Date() - begin;

                console.log('耗时'.bgGreen, time.toString().cyan, 'ms');


                emitter.on({
                    'open': function (host) {
                        if (host == '.') { //提供快捷方式。
                            host = 'localhost';
                        }

                        website.open({ 'host': host, });
                    },

                    'qr': function (width) {
                        website.openQR({ 'width': width, });
                    },
                });

                emitter.fire(args.action, [args.value]);
                done && done(require, module, exports);
            });

            //开始构建。
            website.build(options);

        });
    },

};



