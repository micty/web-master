
/**
* 动态批量引用 less 资源文件。
*/
define('LessBlock', function (require, module, exports) {
    var $ = require('$');
    var Emitter = $.require('Emitter');
    var $String = $.require('String');
    var Lines = require('Lines');
    var Css = require('Css');
    var MD5 = require('MD5');
    var File = require('File');
    var Path = require('Path');
    var Tasks = $.require('Tasks');

    var Meta = module.require('Meta');
    var Parser = module.require('Parser');
    var Watcher = module.require('Watcher');

    var mapper = new Map();

    /**
    * 构造器。
    *   config = {
    *       patterns: [],   //路径模式列表。
    *       excludes: [],   //要排除的模式列表。 里面饱含完整的目录，与字段 dir 无关。
    *       dir: '',        //字段 patterns 路径模式中的相对目录，即要解析的页面所在的目录。 如 `../htdocs/html/test/`。
    *       htdocs: '',     //网站的根目录。 如 `../htdocs/`。
    *       css: '',        //样式目录，相对于 htdocs。 如 `style/css/`。
    *   };
    */
    function LessBlock(config) {
        config = Object.assign({}, config);

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
    LessBlock.prototype = {
        constructor: LessBlock,

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
        * 编译。
        *   options = {
        *       minify: false,      //是否压缩。
        *       concat: false,      //是否合并输出的内容。
        *       dest: {
        *           each: true | '',//是否输出每个分文件对应的目标文件。 如果指定为 true，则使用解析器的结果作为其路径。
        *           all: '',        //是否输出合并后的目标文件。 仅 concat 为 true 时有效。 支持 `{md5}` 模板字段。
        *       },
        *       done: fn,           //编译完成后要执行的回函数。
        *   };
        */
        compile: function (options) {
            options = options || {};

            var done = typeof options == 'function' ? options : options.done;
            var meta = mapper.get(this);
            var tasks = new Tasks(meta.list);
            var dest = options.dest || {};
            var concat = options.concat;

            tasks.on('each', function (item, index, done) {
                var file = dest.each;
                if (file === true) {
                    file = item.dest.file;
                }

                if (!item.link) {
                    console.error('item.link is null.');
                    console.error('item = ', item);
                    console.error('不存在 less 文件:' + item.file);
                    throw new Error();
                }

                item.link.compile({
                    'minify': options.minify,
                    'dest': file,
                    'done': function (output) {
                        done(output);
                    },
                });
            });

            tasks.on('all', function (outputs) {
                //不需要合并。
                if (!concat) {
                    done && done.call(meta.this, outputs);
                    return;
                }

                //需要合并。 
                //合并压缩后，如果产生空行，则说明空的那一行对应的分文件 css 内容为空。
                var contents = outputs.map(function (item) {
                    return item.css;
                });


                var content = Lines.join(contents);
                var md5 = MD5.get(content);
                var file = dest.all;

                if (file) {
                    file = $String.format(file, { 'md5': md5, });
                    File.write(file, content);
                }



                done && done.call(meta.this, {
                    'list': outputs,
                    'content': content,
                    'md5': md5,
                    'dest': file,
                });
            });

            tasks.parallel();
        },

        /**
        * 渲染生成 html。
        *   options = {
        *       inline: false,  //是否内联。
        *       tabs: 0,        //缩进的空格数。
        *       href: '',       //生成到标签中 href 属性。
        *       props: {},      //生成到标签中的其它属性。
        *   };
        */
        render: function (options) {
            options = options || {};

            var meta = mapper.get(this);

            meta.list.forEach(function (item, index) {
                var html = item.link.render({
                    'tabs': options.tabs,
                    'inline': options.inline,
                    'props': options.props,
                    'href': item.dest.href,
                    'md5': 4,
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
        * 构建。
        *   options = {
        *       tabs: 0,            //缩进的空格数。
        *       minify: false,      //是否压缩。
        *       inline: false,      //是否内联。
        *       dest: '',           //输出的目标文件路径，支持 `{md5}` 模板字段。
        *       props: {},          //生成标签中的其它属性。
        *       query: {},          //生成到 href 属性中的 query 部分。
        *       done: fn,           //构建完成后的回调函数。
        *   };
        */
        build: function (options) {
            options = options || {};

            var done = typeof options == 'function' ? options : options.done;
            var meta = mapper.get(this);

            this.compile({
                'minify': options.minify,
                'concat': true,
                'dest': {
                    'each': false,
                    'all': options.dest,
                },

                'done': function (info) {
                    var html = '';

                    if (options.inline) {
                        html = Css.inline({
                            'content': info.content,
                            'tabs': options.tabs,
                            'props': options.props,
                        });
                    }
                    else {
                        var href = Path.relative(meta.dir, info.dest);

                        html = Css.mix({
                            'href': href,
                            'tabs': options.tabs,
                            'props': options.props,
                            'query': options.query,
                        });
                    }

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

            meta.list.forEach(function (item) {
                item.link.destroy();
            });
     
            meta.emitter.destroy();
            meta.watcher && meta.watcher.destroy();
            mapper.delete(this);
        },

    };
        

    //静态方法。
    Object.assign(LessBlock, {
        
    });

    return LessBlock;



});




