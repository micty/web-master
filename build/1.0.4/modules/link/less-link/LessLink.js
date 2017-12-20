
/**
* 静态单个引用 less 资源文件。
*/
define('LessLink', function (require, module, exports) {

    var $ = require('$');
    var $String = $.require('String');
    var Defaults = require('Defaults');
    var File = require('File');
    var Less = require('Less');
    var Css = require('Css');
    var Emitter = $.require('Emitter');

    var Meta = module.require('Meta');
    var Parser = module.require('Parser');
    var Watcher = module.require('Watcher');

    var mapper = new Map();



    /**
    * 构造器。
    *   config = {
    *       file: '',   //输入的源 less 文件路径。
    *   };
    */
    function LessLink(config) {
        config = Defaults.clone(module.id, config);

        var emitter = new Emitter(this);

        var meta = Meta.create(config, {
            'this': this,
            'emitter': emitter,
        });

        mapper.set(this, meta);

        Object.assign(this, {
            'id': meta.id,
            'data': {},     //用户的自定义数据容器。
        });

    }


    //实例方法。
    LessLink.prototype = {
        constructor: LessLink,

        data: {},

        /**
        * 编译。
        *   options = {
        *       minify: false   //是否压缩。
        *       dest: '',       //输出的目标文件路径。 支持编译后的内容 `{md5}` 模板字段。
        *       done: fn,       //编译完成后的回调函数。
        *   };
        */
        compile: function (options) {
            options = options || {};

            var done = typeof options == 'function' ? options : options.done;
            var meta = mapper.get(this);

            Less.compile({
                'src': meta.file,
                'minify': options.minify,

                'done': function (css, md5) {
                    var dest = options.dest || '';
                    var output = meta.output;

                    if (dest) {
                        dest = $String.format(dest, { 'md5': md5, });

                        //此次要写入的跟上次已写入的相同。
                        var existed = dest === output.dest && md5 === output.md5;

                        if (!existed) {
                            File.write(dest, css);
                        }
                    }

                    output = meta.output = {
                        'css': css,
                        'md5': md5,
                        'dest': dest,
                    };

                    done && done.call(meta.this, output);
                },
            });
        },

        /**
        * 渲染生成 html 内容。
        *   内联: `<style>...</style>`。
        *   普通: `<link href="xx.css" rel="stylesheet" />`。
        *   options = {
        *       inline: false,      //是否内联。
        *       tabs: 0,            //缩进的空格数。
        *       href: '',           //生成到 link 标签中的 href 属性值。
        *       md5: 4,             //添加到 href 中 query 部分的 md5 的长度。
        *       query: {} || fn,    //添加到 href 中 query 部分。
        *       props: {},          //生成到标签中的其它属性。
        *    };
        */
        render: function (options) {
            var meta = mapper.get(this);

            //内联方式。
            if (options.inline) {
                var html = Css.inline({
                    'content': meta.output.css,
                    'comment': meta.file,
                    'props': options.props,
                    'tabs': options.tabs,
                });

                return html;
            }

            //普通方式。
            var md5 = options.md5 || 0;
            var href = options.href;
            var query = options.query || {};

            if (typeof query == 'function') {
                query = query(meta.output);
            }

            md5 = md5 === true ? 32 : md5;          //需要截取的 md5 长度。 

            if (md5 > 0) {
                md5 = meta.output.md5.slice(0, md5);    //md5 串值。
                query[md5] = undefined; //这里要用 undefined 以消除 `=`。
            }

            var html = Css.mix({
                'href': href,
                'tabs': options.tabs,
                'props': options.props,
                'query': query,
            });

            return html;
        },

        /**
        * 监控。
        */
        watch: function () {
            var meta = mapper.get(this);

            if (meta.watcher) {
                return;
            }

            meta.watcher = Watcher.create(meta);
        },

        /**
        * 构建。
        *   options = {
        *       minify: false,      //是否压缩。
        *       tabs: 0,            //缩进的空格数。
        *       inline: false,      //是否内联。
        *       dest: '',           //输出的目标文件路径。 支持编译后的内容 `{md5}` 模板字段。
        *       href: '',           //生成到 link 标签中的 href 属性值。
        *       query: null || fn,  //添加到 href 中 query 部分。
        *       md5: 4,             //添加到 href 中 query 部分的 md5 的长度。
        *       props: {},          ///生成到标签中的其它属性。
        *       done: fn,           //构建完成后的回调函数。
        *   };
        */
        build: function (options) {
            options = options || {};

            var done = typeof options == 'function' ? options : options.done;
            var meta = mapper.get(this);

            this.compile({
                'minify': options.minify,
                'dest': options.dest,

                'done': function (output) {
                    var md5 = output.md5;
                    var href = options.href;

                    if (href) {
                        href = $String.format(href, { 'md5': md5, });
                    }

                    var html = this.render({
                        'tabs': options.tabs,
                        'props': options.props,
                        'inline': options.inline,
                        'query': options.query,
                        'md5': options.md5,
                        'href': href,
                    });

                    done && done.call(meta.this, html);
                },
            });
        },



        /**
        * 绑定事件。
        */
        on: function (name, fn) {
            var meta = mapper.get(this);
            meta.emitter.on(...arguments);
        },

        /**
        * 销毁当前对象。
        */
        destroy: function () {
            var meta = mapper.get(this);
            if (!meta) { //已销毁。
                return;
            }

            meta.emitter.destroy();
            meta.watcher && meta.watcher.destroy();
            mapper.delete(this);
        },




    };


    Object.assign(LessLink, {
        'parse': Parser.parse,
        'get': Parser.get,
    });

    return LessLink;



});




