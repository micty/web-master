
/**
* 动态引用 js 资源文件。
*/
define('JsBlock', function (require, module, exports) {
    var $ = require('$');
    var Emitter = $.require('Emitter');
    var $String = $.require('String');
    var Lines = require('Lines');
    var Js = require('Js');
    var MD5 = require('MD5');
    var File = require('File');

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
    function JsBlock(config) {
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
    JsBlock.prototype = {
        constructor: JsBlock,

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
        * 渲染生成 html。
        *   options = {
        *       inline: false,      //是否内联。
        *       tabs: 0,            //缩进的空格数。
        *       md5: 4,             //添加到 href 中 query 部分的 md5 的长度。
        *       query: {} || fn,    //添加到 href 中 query 部分。
        *       props: {},          //生成到标签中的其它属性。
        *   };
        */
        render: function (options) {
            options = options || {};

        
            var meta = mapper.get(this);

            meta.list.forEach(function (item, index) {

                var html = item.link.render({
                    'href': item.href,
                    'tabs': options.tabs,
                    'inline': options.inline,
                    'md5': options.md5,
                    'query': options.query,
                    'props': options.props,
                });

                meta.contents[index] = html;
            });

            var html = Lines.join(meta.contents);

            return html;

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
                    meta.change(true);
                });

                link.watch();
            });

        },

        /**
        * 合并文件列表。
        *   options = {
        *       begin: '',      //可选，闭包头文件。
        *       end: '',        //可选，闭包的尾文件。
        *       dest: '',       //可选，要写入的目标文件。 支持 `{md5}` 模板字段。
        *       minify: false,  //可选，是否压缩。
        *   };
        */
        concat: function (options) {
            options = options || {};

            var dest = options.dest || '';
            var meta = mapper.get(this);

            var list = meta.list.map(function (item) {
                return item.file;
            });

            //先合并。
            var concat = Js.concat(list, {
                'begin': options.begin,
                'end': options.end,
            });

            var content = concat.content;
            var md5 = concat.md5;

            //再压缩。
            if (content && options.minify) {
                content = Js.minify({ 'content': content, });
                md5 = MD5.get(content);
            }

            //写入合并后的 js 文件。
            if (dest) {
                dest = $String.format(dest, { 'md5': md5, });
                File.write(dest);
            }

            return {
                'content': content,
                'md5': md5,
                'dest': dest,
                'minify': options.minify,
                'list': list,
            };
        },

        /**
        * 构建。
        *   options = {
        *       tabs: 0,        //缩进空格数。
        *       begin: '',      //闭包的头文件。
        *       end: '',        //闭包的尾文件。
        *       minify: false,  //是否压缩。
        *       inline: false,  //是否内联。
        *       name: '',       //要写入目标文件名。 如果指定则写入，否则忽略。
        *       props: {},      //生成到 script 标签中其它属性。
        *       query: {},      //生成到 script 标签 src 属性里的 query 部分。 
        *   };
        */
        build: function (options) {
            options = options || {};

            var meta = mapper.get(this);
            var href = '';
            var dest = '';
            var name = options.name;

            if (name) {
                href = name;
                dest = meta.dir + name;
            }


            var html = Js.build({
                'list': meta.list,
                'begin': options.begin,
                'end': options.end,
                'tabs': options.tabs,
                'minify': options.minify,
                'inline': options.inline,
                'props': options.props,
                'query': options.query,
                'dest': dest,
                'href': href,
            });

            return html;
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
    Object.assign(JsBlock, {

    });

    return JsBlock;



});




