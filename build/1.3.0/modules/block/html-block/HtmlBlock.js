
/**
* 动态引用 html 资源文件。
*/
define('HtmlBlock', function (require, module, exports) {
    var $ = require('$');
    var Emitter = $.require('Emitter');
    var $String = $.require('String');
    var Lines = require('Lines');
    var MD5 = require('MD5');
    var Html = require('Html');

    var Meta = module.require('Meta');
    var Parser = module.require('Parser');
    var Watcher = module.require('Watcher');

    var mapper = new Map();


    /**
    * 构造器。
    *   options = {
    *       patterns: [],   //路径模式列表。
    *       dir: '',        //路径模式中的相对目录，即要解析的页面所在的目录。 如 `../htdocs/html/test/`。
    *   };
    */
    function HtmlBlock(config) {
        config = Object.assign({}, config);

        var emitter = new Emitter(this);

        var meta = Meta.create(config, {
            'this': this,
            'emitter': emitter,
        });

        mapper.set(this, meta);

        Object.assign(this, {
            'id': meta.id,
            'data': {},         //用户自定义数据容器。
                
        });
    }

    //实例方法。
    HtmlBlock.prototype = {
        constructor: HtmlBlock,

        data: {},

        /**
        * 重置为初始状态，为新一轮的解析做准备。
        */
        reset: function () {
            var meta = mapper.get(this);
            Meta.reset(meta);
        },

        /**
        * 解析。
        *   options = {
        *       error: function(file),      //文件不存时要执行的函数。
        *   };
        */
        parse: function (options) {
            var meta = mapper.get(this);
            meta.list = Parser.parse(meta, options);
        },

        /**
        * 设置特定的字段。
        */
        set: function (key, value) {
            var meta = mapper.get(this);

            switch (key) {
                case 'excludes':
                    var excludes = value || [];
                    var changed = JSON.stringify(excludes) != JSON.stringify(meta.excludes);

                    if (changed) {
                        meta.excludes = excludes.slice(0);
                        meta.this.reset();
                        meta.this.parse();
                        meta.this.watch();
                        meta.change();
                    }

                    break;
            }
        },

        /**
        * 渲染生成 html 内容。
        * 主要提供给 watch 发生改变时快速混入。
        *   options = {
        *       tabs: 0,    //缩进的空格数。
        *   };
        */
        render: function (options) {
            var meta = mapper.get(this);

            meta.list.forEach(function (item, index) {
                var html = item.link.render({
                    'tabs': options.tabs,
                });

                meta.contents[index] = html;
            });

            var html = Lines.join(meta.contents);

            return html;
        },

        /**
        * 编译。
        *   options = {
        *       tabs: 0,        //要缩进的空格数。
        *       minify: false,  //是否压缩。
        *       dest: '',       //要写入的目标文件。 支持 `{md5}` 模板字段。
        *   };
        */
        compile: function (options) {
            options = options || {};

            var content = this.render({ 'tabs': options.tabs, });
            var minify = options.minify;

            if (minify) {
                content = Html.minify(content, minify);
            }

            var md5 = MD5.get(content);
            var dest = options.dest;

            if (dest) {
                dest = $String.format(dest, {
                    'md5': md5,
                });

                File.write(dest, content);
            }

            return {
                'content': content,
                'md5': md5,
                'dest': dest,
                'minify': minify,
            };
        },



        /**
        * 监控当前引用文件和下级列表的变化。
        */
        watch: function () {
            var meta = mapper.get(this);

            meta.watcher = meta.watcher || Watcher.create(meta);

            meta.list.forEach(function (item, index) {
                if (item.isOld) { //复用过来的，不需要重新绑定。
                    return;
                }

                var link = item.link;

                link.on('change', function () {
                    meta.change(500);
                });

                link.watch();
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

            meta.list.forEach(function (item) {
                item.link.destroy();
            });
     
            meta.emitter.destroy();
            meta.watcher && meta.watcher.destroy();
            mapper.delete(this);
        },

    };
        

    //静态方法。
    Object.assign(HtmlBlock, {
        
    });

    return HtmlBlock;



});




