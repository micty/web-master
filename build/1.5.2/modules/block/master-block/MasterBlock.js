
/**
* 动态批量引用母版页资源文件。
*/
define('MasterBlock', function (require, module, exports) {
    var $ = require('$');
    var Emitter = $.require('Emitter');
    var Tasks = $.require('Tasks');

    var Meta = module.require('Meta');
    var Parser = module.require('Parser');
    var Watcher = module.require('Watcher');

    var mapper = new Map();

    /**
    * 构造器。
    *   options = {
    *       patterns: [],   //路径模式列表。
    *       excludes: {},   //用于传递给 MasterPage 实例。 要排除的路径模式。
    *       htdocs: '',     //用于传递给 MasterPage 实例。 网站的根目录。 如 `../htdocs/`。 
    *       css: '',        //用于传递给 MasterPage 实例。 样式目录，相对于 htdocs。 如 `style/css/`。 
    *       dest: '',       //用于传递给 MasterPage 实例。 输出的目标页面的名称模板。 如 `{name}.html`。 
    *   };
    */
    function MasterBlock(config) {
        config = Object.assign({}, config);

        var emitter = new Emitter(this);

        var meta = Meta.create(config, {
            'this': this,
            'emitter': emitter,
        });

        mapper.set(this, meta);

        Object.assign(this, {
            'id': meta.id,
            'data': {},           //用户自定义数据容器。
        });
    }

    //实例方法。
    MasterBlock.prototype = {
        constructor: MasterBlock,

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
            meta.list = Parser.parse(meta);

            var files = meta.list.map(function (item) {
                return item.file;
            });

            return files;
        },

        /**
        * 设置特定的字段。
        */
        set: function (key, value) {
            var meta = mapper.get(this);

            switch (key) {
                case 'excludes': //设置要排除的模式。
                    meta.list.forEach(function (item) {
                        item.master.set(key, value);
                    });
                    break;
            }
        },

        /**
        * 编译。
        *   options = {
        *       minify: false,      //是否压缩。
        *       done: fn,           //编译完成后要执行的回函数。
        *   };
        */
        compile: function (options) {
            options = options || {};

            var done = typeof options == 'function' ? options : options.done;
            var meta = mapper.get(this);
            var tasks = new Tasks(meta.list);
            var key = JSON.stringify(options);  //缓存用的 key 与 options 有关。

            tasks.on('each', function (item, index, done) {
                var output = item.key$output[key];
                if (output) {
                    console.log('使用缓存'.bgGreen, item.file.gray);
                    item.output = output;
                    return done();
                }


                meta.emitter.fire('compile', 'each', 'before', [item]);

                item.master.compile({
                    'minify': options.minify,

                    'done': function () {
                        item.key$output[key] = true;
                        item.output = true;
                        meta.emitter.fire('compile', 'each', 'done', [item]);
                        done();
                    },
                });
            });

            tasks.on('all', function () {
                done && done.call(meta.this);
            });

            tasks.parallel();
        },

        /**
        * 监控列表的变化。
        */
        watch: function () {
            var meta = mapper.get(this);

            meta.watcher = meta.watcher || Watcher.create(meta);

            meta.list.forEach(function (item, index) {
                if (item.isOld) { //复用过来的，不需要重新绑定。
                    return;
                }

                var master = item.master;

                master.on('change', function () {
                    item.output = null;
                    item.key$output = {};

                    meta.change(100);
                });

                master.watch();
            });

        },


        /**
        * 构建。
        *   options = {
        *       lessLink: {},
        *       lessBlock: {},
        *       jsBlock: {},
        *       html: {},
        *   };
        */
        build: function (options) {

            var meta = mapper.get(this);

            //并行处理任务。
            var tasks = new Tasks(meta.list);

            tasks.on('each', function (item, index, done) {
                var master = item.master;

                meta.emitter.fire('build', 'each', 'before', [item]);

                master.build({
                    'lessLink': options.lessLink,
                    'lessBlock': options.lessBlock,
                    'jsBlock': options.jsBlock,
                    'html': options.html,

                    'done': function () {
                        meta.emitter.fire('build', 'each', 'done', [item]);
                        done(master);
                    },
                });
            });

            tasks.on('all', function (masters) {
                meta.emitter.fire('build', 'all');
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

            meta.list.forEach(function (item) {
                item.master.destroy();
            });
     
            meta.emitter.destroy();
            meta.watcher && meta.watcher.destroy();
            mapper.delete(this);
        },

    };
        

    //静态方法。
    Object.assign(MasterBlock, {
       
    });

    return MasterBlock;



});




