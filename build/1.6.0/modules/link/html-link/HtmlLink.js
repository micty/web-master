
/**
* 静态引用 html 资源文件。
*/
define('HtmlLink', function (require, module, exports) {
    var $ = require('$');
    var Emitter = $.require('Emitter');
    var File = require('File');
    var Lines = require('Lines');

    var Meta = module.require('Meta');
    var Parser = module.require('Parser');
    var Tabs = module.require('Tabs');
    var Watcher = module.require('Watcher');

    var mapper = new Map();

    /**
    * 构造器。
    *   config = {
    *       file: '',       //html 片段文件路径。
    *       content: '',    //html 片段文件内容，如果与 file 字段同时指定，则优先取本字段。
    *       parent: null,   //所属于的父节点。
    *   };
    */
    function HtmlLink(config) {
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
    HtmlLink.prototype = {
        constructor: HtmlLink,

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

            var info = Parser.parse({
                'file': meta.file,
                'content': meta.content,
            });

            Object.assign(meta, info);

            //解析出来的新列表，尽量复用之前创建的实例。
            var file$link = meta.file$link;     //当前集合。
            var old$link = meta.old.file$link;  //旧集合。
            var news = [];  //需要新建的。
            var olds = [];  //可以复用的。

            meta.list.forEach(function (item) {
                var file = item.file;
                var link = old$link[file];

                if (!link) {
                    news.push(item);
                    return;
                }

                item.isOld = true;
                olds.push(file);
                item.link = file$link[file] = link;
            });


            //有可能同一个文件名给引用了多次，这里也对应为一个实例。
            news.forEach(function (item) {
                var file = item.file;

                if (!File.exists(file)) {
                    console.error('不存在 html 文件', file);
                    console.log('所在的 html 文件'.bgCyan, meta.file.cyan);
                    Lines.highlight(info.lines, item.no);
                    throw new Error();
                }

                var link = file$link[file] || new HtmlLink({
                    'file': file,
                    'parent': meta.this,
                });

                item.link = file$link[file] = link;
                link.parse();
            });

            //释放备份中没有复用到的实例。
            Object.keys(old$link).forEach(function (file) {
                var link = old$link[file];
                delete old$link[file];

                if (!olds.includes(file)) {
                    link.destroy();
                }
            });

        },

        /**
        * 渲染生成 html。
        * 把对 html 分文件的引用用所对应的内容替换掉。
        *   options = {
        *       tabs: 0,    //缩进的空格数。
        *   };
        */
        render: function (options) {
            options = options || {};

            var meta = mapper.get(this);
            var tabs = options.tabs || 0;
            var key = JSON.stringify(options);
            var html = meta.key$output[key];

            //优先使用缓存。
            if (html) {
                //console.log('使用缓存'.bgGreen, meta.file.gray);
                return html;
            }


            var lines = meta.lines;

            meta.list.map(function (item, index) {
                var tabs = item.tabs;

                var html = item.link.render({
                    'tabs': tabs,
                });

                //明确指定了要缩进的空格数，则添加特殊而唯一的开始和结束标记，
                //把 html 内容包起来，以便在别的模块作最终处理。
                //因为这里是无法得知本身应该缩进多少的，在最终要生成的 html 页面中才可以得知并进行处理。
                if (item.props.tabs) {
                    html = Tabs.wrap({
                        'content': html,
                        'origin': tabs,
                        'target': item.props.tabs,
                        'file': item.file,
                    });
                }

                lines[item.no] = html;
            });

            html = Lines.stringify(lines, ' ', tabs);
            meta.key$output[key] = html;

            console.log('混入'.yellow, meta.file.green);

            return html;

        },

        /**
        * 监控当前引用文件和下级列表的变化。
        */
        watch: function () {
            var meta = mapper.get(this);

            meta.watcher = meta.watcher || Watcher.create(meta);

            meta.list.map(function (item, index) {
                //有些是复用过来的，则可能已给 watch 过了。
                if (item.isOld) { 
                    return;
                }

                var link = item.link;

                //多个下级在一定时间内的多次 change 只会触发当前实例的一次 change 事件。
                link.on('change', function () {
                    var html = link.render({ 'tabs': item.tabs, }); 

                    meta.lines[item.no] = html;
                    meta.key$output = {};      //下级发生了变化，本级缓存作废。
                    meta.change(500);
                });

                link.watch();
            });

        },

        /**
        * 迭代执行每个下级。
        */
        each: function (fn) {
            var meta = mapper.get(this);
            meta.list.forEach(fn);
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
    Object.assign(HtmlLink, {
        'parse': Parser.parse,
        'replaceTabs': Tabs.replace,

    });



    return HtmlLink;



});




