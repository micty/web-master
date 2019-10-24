
/**
* 母版页类。
* 事件：
    ('render', 'master');
    ('render', 'js-link');
    ('change');
*/
define('MasterPage', function (require, module, exports) {
    var $ = require('$');
    var File = require('File');
    var Lines = require('Lines');
    var Html = require('Html');
    var MD5 = require('MD5');
    var Tasks = $.require('Tasks');
    var Emitter = $.require('Emitter');
    var $String = $.require('String');
    var HtmlLink = require('HtmlLink');

    var Meta = module.require('Meta');
    var Watcher = module.require('Watcher');
    var Validater = module.require('Validater');

    var CssLinks = module.require('CssLinks');
    var LessLinks = module.require('LessLinks');
    var HtmlLinks = module.require('HtmlLinks');
    var JsLinks = module.require('JsLinks');

    var HtmlBlocks = module.require('HtmlBlocks');
    var LessBlocks = module.require('LessBlocks');
    var JsBlocks = module.require('JsBlocks');

    var defaults = module.require('defaults');;
    var mapper = new Map();


    /**
    * 构造器。
    *   config = {
    *       file: '',       //输入的母版页文件路径。 如 `../htdocs/html/test/index.master.html`。
    *       htdocs: '',     //网站的根目录。 如 `../htdocs/`。
    *       css: '',        //样式目录，相对于 htdocs。 如 `style/css/`。
    *       dest: '',       //输出的目标页面的名称模板。 如 `{name}.html`。
    *       excludes: {     //
    *           less: [],   //
    *           html: [],   //
    *           js: [],     //
    *       },
    *   };
    */
    function MasterPage(config) {
        config = Object.assign({}, defaults, config);

        var emitter = new Emitter(this);

        var meta = Meta.create(config, {
            'emitter': emitter,
            'this': this,
        });


        mapper.set(this, meta);

        Object.assign(this, {
            'id': meta.id,
            'data': {},           //用户自定义数据容器。
        });
    }

    //实例方法。
    MasterPage.prototype = {
        constructor: MasterPage,

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
        */
        parse: function () {
            var meta = mapper.get(this);
            var file = meta.file;
            var content = File.read(file);

            var content2 = meta.emitter.fire('parse', 'master', [file, content, {
                'id': meta.id,          //当前实例 id。
                'name': meta.name,      //短名称。
                'dir': meta.dir,        //当前母版页所在的目录。
                'dest': meta.dest,      //输出的目标页面的路径。
                'htdocs': meta.htdocs,  //网站的根目录。
                'css': meta.css,        //样式目录，相对于网站的根目录，如 `style/css/`。

            }]).slice(-1)[0];


            meta.content = typeof content2 == 'string' ? content2 : content;
            meta.lines = Lines.split(meta.content);



            meta.CssLinks = CssLinks.parse(meta);
            meta.LessLinks = LessLinks.parse(meta);
            meta.HtmlLinks = HtmlLinks.parse(meta);
            meta.JsLinks = JsLinks.parse(meta);

            meta.HtmlBlocks = HtmlBlocks.parse(meta);
            meta.LessBlocks = LessBlocks.parse(meta);
            meta.JsBlocks = JsBlocks.parse(meta);

        },

        /**
         * 设置特定的字段。
         */
        set: function (key, value) {
            var meta = mapper.get(this);

            switch (key) {
                case 'excludes':
                    meta.LessBlocks.forEach(function (item) {
                        item.block.set(key, value['less']);
                    });

                    meta.HtmlBlocks.forEach(function (item) {
                        item.block.set(key, value['html']);
                    });

                    meta.JsBlocks.forEach(function (item) {
                        item.block.set(key, value['js']);
                    });

                    break;
            }
        },

        /**
        * 渲染生成 html (文件)。
        *   options = {
        *       minify: false,      //可选。 是否压缩。
        *       dest: true | '',    //是否输出目标文件，或者指定为一个文件路径。 支持 `{name}`、`{md5}` 模板字段。
        *   };
        */
        render: function (options) {
            options = options || {};

            var meta = mapper.get(this);
            var minify = options.minify;
            var html = Lines.stringify(meta.lines);


            html = HtmlLink.replaceTabs(html);


            var dest = options.dest;
            var invalid = Validater.checkIds(html);

            //if (invalid) {
            //    throw new Error();
            //}

            if (minify) {
                html = Html.minify(html, minify);
            }


            var md5 = MD5.get(html);


            if (dest) {
                dest = dest === true ? meta.dest : dest;

                dest = $String.format(dest, {
                    'name': meta.name,
                    'md5': md5,
                });
            }

            //取事件的最后一个回调的返回值作为要渲染的内容（如果有）。
            //最后一个参数传一个 object 出去，让外界面尽可能多的拿到一些元数据。
            var html2 = meta.emitter.fire('render', 'master', [dest, html, {
                'minify': minify,       //是否压缩。
                'md5': md5,             //html 内容的 md5 值。
                'id': meta.id,          //当前实例 id。
                'name': meta.name,      //短名称。
                'file': meta.file,      //当前母版页的文件路径。
                'dir': meta.dir,        //当前母版页所在的目录。
                'dest': meta.dest,      //输出的目标页面的路径。
                'htdocs': meta.htdocs,  //网站的根目录。
                'css': meta.css,        //样式目录，相对于网站的根目录，如 `style/css/`。
            }]).slice(-1)[0];


            if (typeof html2 == 'string') {
                html = html2;
            }

            if (dest) {
                File.write(dest, html);
            }

            return html;
        },

        /**
        * 编译当前母版页。
        *   options = {
        *       minify: false,  //可选，是否压缩。
        *       done: fn,       //可选，编译完成后要执行的回调函数。
        *   };
        */
        compile: function (options) {
            options = options || {};

            var done = typeof options == 'function' ? options : options.done;
            var meta = mapper.get(this);

            var tasks = new Tasks([
                CssLinks,
                LessLinks,
                HtmlLinks,
                JsLinks,

                LessBlocks,
                HtmlBlocks,
                JsBlocks,
            ]);

            tasks.on('each', function (M, index, done) {
                M.render(meta, done);
            });

            tasks.on('all', function () {
                meta.this.render({
                    'minify': options.minify,
                    'dest': true,
                });

                done && done.call(meta.this);
            });

            tasks.parallel();
            
        },

     

        /**
        * 监控。
        */
        watch: function () {
            var meta = mapper.get(this);


            meta.watcher = meta.watcher || Watcher.create(meta);


            CssLinks.watch(meta);
            LessLinks.watch(meta);
            HtmlLinks.watch(meta);
            JsLinks.watch(meta);

            HtmlBlocks.watch(meta);
            LessBlocks.watch(meta);
            JsBlocks.watch(meta);
        },

        /**
        * 构建。
        *   options = {
        *       lessLink: {
        *           minify: true,       //是否压缩。
        *           name: '{md5}.css',  //如果指定，则输出目标文件。 支持模板字段 `{name}` 和 `{md5}`。
        *           md5: 4,             //添加到 href 中 query 部分的 md5 的长度。
        *           query: null || fn,  //添加到 href 中 query 部分。
        *       },
        *       lessBlock: {
        *           minify: false,      //是否压缩。
        *           inline: false,      //是否内联。
        *           dest: '{md5}.css',  //输出的目标文件名。 支持 `{md5}` 模板字段。 
        *           props: {},          //输出到标签里的 html 属性。
        *           query: {},          //生成到 href 属性中的 query 部分。
        *       },
        *       jsBlock: {
        *           begin: '',          //闭包的头片段文件路径。
        *           end: '',            //闭包的尾片段文件路径。
        *           minify: false,      //是否压缩。
        *           inline: false,      //是否内联。
        *           name: '{md5}'.js,   //输出的目标文件路径，支持 `{md5}` 模板字段。 目录为当前页面所在的目录。
        *           props: {},          //生成到标签里的其它属性。
        *           query: {},          //生成标签 src 属性里的 query 部分。 
        *           transform: fn,      //可选。 合并完成后、压缩之前，要对 js 内容进行转码的函数(如 babel 转码)。
        *       },
        *       html: {
        *           minify: false,      //是否压缩。    
        *       },
        *       done: fn,               //构建完成后要执行的回调函数。
        *   };
        */
        build: function (options) {
            options = options || {};

            var done = typeof options == 'function' ? options : options.done;
            var meta = mapper.get(this);

            var tasks = new Tasks([
                { 'fn': CssLinks.build, },
                { 'fn': LessLinks.build, 'opt': options.lessLink, },
                { 'fn': HtmlLinks.render,  },
                { 'fn': JsLinks.build, },

                { 'fn': LessBlocks.build, 'opt': options.lessBlock, },
                { 'fn': HtmlBlocks.render, },
                { 'fn': JsBlocks.build, 'opt': options.jsBlock, },
            ]);

            tasks.on('each', function (item, index, done) {
                var fn = item.fn;
                var opt = item.opt;
                
                opt ? fn(meta, opt, done) : fn(meta, done);

            });

            tasks.on('all', function () {
                var opt = options.html || {};

                meta.this.render({
                    'minify': opt.minify,
                    'dest': true,
                });

                done && done.call(meta.this);
            });

            tasks.parallel();


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

            meta.link.destroy();
            meta.emitter.destroy();
            meta.watcher && meta.watcher.destroy();

            meta.CssLinks.forEach(function (item) {
                item.link.destroy();
            });

            meta.LessLinks.forEach(function (item) {
                item.link.destroy();
            });

            meta.HtmlLinks.forEach(function (item) {
                item.link.destroy();
            });

            meta.JsLinks.forEach(function (item) {
                item.link.destroy();
            });


            meta.LessBlocks.forEach(function (item) {
                item.block.destroy();
            });

            meta.HtmlBlocks.forEach(function (item) {
                item.block.destroy();
            });

            meta.JsBlocks.forEach(function (item) {
                item.block.destroy();
            });


            mapper.delete(this);
        },
      
    };

    //静态方法。
    Object.assign(MasterPage, {
        /**
        * 设置默认配置项。
        *   options = {
        *       tags: {
        *           less: { begin: '', end: '', },
        *           html: { begin: '', end: '', },
        *           js: { begin: '', end: '', },
        *       }, 
        *   };
        */
        config: function (options) {
            var tags = options.tags;

            if (tags) {
                Object.assign(defaults.tags, tags);
            }
        },
    });

    return MasterPage;

});




