
/**
* 动态批量引用 package.json 资源文件。
* 事件：
*   ('change', 'patterns');
*   ('compile', 'each', 'before');
*   ('compile', 'each', 'done');
*/
define('PackageBlock', function (require, module, exports) {
    var $ = require('$');
    var Emitter = $.require('Emitter');
    var Tasks = $.require('Tasks');
    var $Object = $.require('Object');
    var File = require('File');
    var Patterns = require('Patterns');

    var Meta = module.require('Meta');
    var Parser = module.require('Parser');
    var Watcher = module.require('Watcher');

    var mapper = new Map();

    /**
    * 构造器。
    *   options = {
    *       patterns: [],   //路径模式列表。
    *       htdocs: '',     //网站的根目录。 如 `../htdocs/`。
    *       css: '',        //样式目录，相对于 htdocs。 如 `style/css/`。
    *       dest: {
    *           dir: '',    //分包资源打包后的输出目录，相对于网站根目录。 如 `package/`。
    *           file: '',   //总包文件的输出文件路径，，相对于网站根目录。 如 `package/package.json`。
    *       },
    *   };
    */
    function PackageBlock(config) {
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
    PackageBlock.prototype = {
        constructor: PackageBlock,

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
            var list = meta.list = Parser.parse(meta);

            //收集文件列表。
            var files = list.map(function (item) {
                return item.file;
            });

            //分类的总模式发生了变化。
            var changed = Parser.merge(meta);

            if (changed) {
                meta.emitter.fire('change', 'patterns', [meta.type$patterns]);
            }

            return files;
        },

        /**
        * 
        */
        get: function (key) {
            var meta = mapper.get(this);

            switch (key) {
                case 'type$patterns':
                    return meta[key];
            }
        },

        /**
        * 编译。
        *   options = {
        *       minify: false,      //是否压缩。
        *       name: '{name}',     //输出的文件名，支持 `{name}`: 当前的包名、`{md5}`: 内容的 md5 值两个模板字段。
        *       begin: '',          //可选。 合并 js 的闭包头文件。
        *       end: '',            //可选。 合并 js 的闭包的尾文件。
        *       query: {},          //生成到 href 中的 query 部分。
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
                    //console.log('使用缓存'.bgGreen, item.file.gray);
                    item.output = output;
                    return done();
                }


                meta.emitter.fire('compile', 'each', 'before', [item]);

                item.pack.compile({
                    'minify': options.minify,
                    'name': options.name,
                    'begin': options.begin,
                    'end': options.end,

                    'done': function () {
                        var output = this.get({
                            'query': options.query,
                        });

                        item.key$output[key] = output;
                        item.output = output;
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
        * 监控当前引用文件和下级列表的变化。
        */
        watch: function () {
            var meta = mapper.get(this);
            meta.watcher = Watcher.create(meta);
        },

        /**
        * 写入到总包中。
        *   options = {
        *       minify: false,      //是否压缩。
        *   };
        */
        write: function (options) {
            var meta = mapper.get(this);
            var minify = options.minify;
            var json = {};

            meta.list.forEach(function (item) {
                var output = item.output;
                json[output.name] = output.json;

            });


            File.writeJSON(meta.dest.file, json, minify);
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
                item.pack.destroy();
            });
     
            meta.emitter.destroy();
            meta.watcher && meta.watcher.destroy();
            mapper.delete(this);
        },

    };
        

    //静态方法。
    Object.assign(PackageBlock, {
        
    });

    return PackageBlock;



});




