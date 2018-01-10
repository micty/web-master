
/**
* 私有包。
*/
define('Package', function (require, module, exports) {

    var $ = require('$');
    var Tasks = $.require('Tasks');
    var Query = $.require('Query');
    var $Object = $.require('Object');
    var File = require('File');
    var FileRefs = require('FileRefs');
    var Path = require('Path');
    var Defaults = require('Defaults');
    var Lines = require('Lines');
    var Url = require('Url');
    var Patterns = require('Patterns');
    var Log = require('Log');

    var Emitter = $.require('Emitter');


    var Meta = module.require('Meta');
    var Parser = module.require('Parser');
    var LessBlock = module.require('LessBlock');
    var JsBlock = module.require('JsBlock');
    var HtmlBlock = module.require('HtmlBlock');
    var Watcher = module.require('Watcher');

    var mapper = new Map();


    /**
    * 构造器。
    *   config = {
    *       file: '',       //输入的源包文件。 如 `../htdocs/html/test/modules/user/package.json`。
    *       htdocs: '',     //网站的根目录。
    *       css: '',        //css 打包后的输出目录，相对于网站根目录。 如 `style/css/`。
    *       dest: '',       //js 和 html 打包后的输出目录，相对于网站根目录。 如 `package/`。
    *   };
    */
    function Package(config) {

        config = Defaults.clone(module.id, config);

        var meta = Meta.create(config, {
            'emitter': new Emitter(this),
            'this': this,
        });

        mapper.set(this, meta);

        this.name = '';
    }



    Package.prototype = {
        constructor: Package,

        /**
        * 当前包的名称。
        */
        name: '',

        /**
        * 重置。
        */
        reset: function () {
            var meta = mapper.get(this);
            Meta.reset(meta);
        },

        /**
        * 解析当前包文件。
        * 已重载 parse(); 
        * 已重载 parse(info); 给模块内部 `/Wacher`调用的。
        */
        parse: function (info) {
            var meta = mapper.get(this);

            info = info || Parser.parse(meta.file);

            Object.assign(meta, info);
            meta.LessBlock = LessBlock.create(meta);
            meta.JsBlock = JsBlock.create(meta);
            meta.HtmlBlock = HtmlBlock.create(meta);

            this.name = info.name; //增加一个字段。

            return info;


        },

        /**
        * 编译当前包文件。
        *   options = {
        *       minify: false,      //是否压缩。
        *       name: '{name}',     //输出的文件名，支持 `{name}`: 当前的包名、`{md5}`: 内容的 md5 值两个模板字段。
        *       begin: '',          //可选。 合并 js 的闭包头文件。
        *       end: '',            //可选。 合并 js 的闭包的尾文件。
        *       done: fn,           //编译完成后要执行的回调函数。
        *   };
        */
        compile: function (options) {
            options = options || {};

            var done = typeof options == 'function' ? options : options.done;
            var meta = mapper.get(this);

            var tasks = new Tasks([
                LessBlock,
                JsBlock,
                HtmlBlock,
            ]);

            tasks.on('each', function (M, index, done) {
                var config = {
                    'minify': options.minify,
                    'name': options.name,
                    'done': done,
                };

                if (M === JsBlock) {
                    config.begin = options.begin;
                    config.end = options.end;
                }

                M.compile(meta, config);
            });

            tasks.on('all', function () {
                done && done.call(meta.this);
            });

            tasks.parallel();

        },

        /**
        * 监控当前包文件及各个资源引用模块。
        */
        watch: function () {
            var meta = mapper.get(this);

            if (meta.watcher) {
                return;
            }


            //为了使用子模块，这里单独成方法传进去。
            meta.watcher = Watcher.create(meta, {
                'LessBlock': LessBlock,
                'JsBlock': JsBlock,
                'HtmlBlock': HtmlBlock,

                'compare': function () {
                    var info = Parser.compare(meta.file, meta);
                    return info;
                },
            });

            LessBlock.watch(meta);
            JsBlock.watch(meta);
            HtmlBlock.watch(meta);


        },


        /**
        * 获取包的输出内容。
        *   options = {
        *       query: {
        *           md5: 4,     //md5 的长度。 此字段是特殊的，当指定时，则认为是要截取的 md5 的长度。
        *       },
        *   };
        */
        get: function (options) {
            options = options || {};

            var meta = mapper.get(this);
            var type$output = meta.type$output;
            var json = {};
            var query = Object.assign({}, options.query); //因为要删除 md5 字段，为避免互相影响，先拷贝一份。
            var md5Len = query['md5'] || 0;
            
            delete query['md5'];


            $Object.each(type$output, function (type, output) {
                if (!output) {
                    return;
                }

                var href = output.href;

                if (!href) {
                    return;
                }

                var md5 = output.md5.slice(0, md5Len);
                if (md5) {
                    href = Query.add(href, md5);
                }

                if (!$Object.isEmpty(query)) {
                    href = Query.add(href, query);
                }

                json[type] = href;

            });


            return {
                'name': meta.name,
                'old': meta.old.name,
                'json': json,
            };
        },

        /**
        * 绑定事件。
        */
        on: function (name, fn) {
            var meta = mapper.get(this);
            var emitter = meta.emitter;

            var args = [].slice.call(arguments, 0);
            emitter.on.apply(emitter, args);

        },

        /**
        * 销毁当前对象。
        */
        destroy: function () {
            var meta = mapper.get(this);
            if (!meta) { //已销毁。
                return;
            }

            var old = meta.old;


            meta.emitter.destroy();
            meta.watcher && meta.watcher.destroy();

            meta.LessBlock && meta.LessBlock.destroy();
            old.LessBlock && old.LessBlock.destroy();

            meta.JsBlock && meta.JsBlock.destroy();
            old.JsBlock && old.JsBlock.destroy();

            meta.HtmlBlock && meta.HtmlBlock.destroy();
            old.HtmlBlock && old.HtmlBlock.destroy();

            //删除对应的输出文件。
            $Object.each(meta.type$output, function (type, output) {
                if (!output || !output.dest) {
                    return;
                }

                var dest = output.dest;
                File.delete(dest);
                console.log('删除'.red, dest.gray);
            });

            mapper.delete(this);
        },

    };


    //静态方法。
    Object.assign(Package, {

    });

    return Package;


});




