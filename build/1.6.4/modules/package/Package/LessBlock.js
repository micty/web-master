
/**
* 
*/
define('Package/LessBlock', function (require, module, exports) {
    var $ = require('$');
    var $String = $.require('String');
    var LessBlock = require('LessBlock');
    var File = require('File');
    var Query = $.require('Query');


    return exports = {
        /**
        * 
        * 根据路径模式，尽量复用以前的实例和输出结果。
        */
        create: function (meta) {
            var patterns = meta.patterns.less;
            var old = meta.old;
            var block = old.LessBlock;

            if (!patterns || !patterns.length) {
                block && block.destroy();
                old.LessBlock = null;
                return null;
            }


            var key0 = patterns.join();
            var key1 = old.patterns.less.join();

            //路径模式不变，则复用之前的(如果有)。
            if (key0 == key1 && block) {
                meta.type$output['css'] = old.type$output['css'];
                meta.compile['css'] = old.compile['css'];
                return block;
            }

            //路径模式不同，要新建。

            block = new LessBlock({
                'htdocs': meta.htdocs,
                'dir': meta.dir,
                'patterns': patterns,
                'delay': 0,
            });

            block.parse();

            return block;
            
        },

        /**
        * 编译。
        *   options = {
        *       minify: false,      //是否压缩。
        *       name: '{name}',     //输出的文件名，支持 `{name}`: 当前的包名、`{md5}`: 内容的 md5 值两个模板字段。
        *       done: fn,           //编译完成后要执行的回调函数。
        *   };
        */
        compile: function (meta, options) {
            options = options || {};

            var done = typeof options == 'function' ? options : options.done;
            var block = meta.LessBlock;

            if (!block) {
                return done();
            }

            //先使用缓存。
            var key = JSON.stringify(options);
            var output = meta.compile['css'][key];

            if (output) {
                meta.type$output['css'] = output;   //引到用最近一次的。
                return done();
            }

            //
            block.compile({
                'minify': options.minify,
                'concat': true,

                'done': function (info) {
                    var content = info.content;
                    var md5 = info.md5;

                    var sample = meta.css + options.name + '.css';

                    var href = $String.format(sample, {
                        'name': meta.name,
                        'md5': md5,
                    });

                    var dest = meta.htdocs + href;



                    //有可能是空内容。
                    var output = !content ? {} : {
                        'dest': dest,
                        'href': href,
                        'md5': md5,
                        'minify': options.minify,
                    };

                    meta.type$output['css'] = output;
                    meta.compile['css'][key] = output;

                    content && File.write(dest, content);  //有内容才写入。

                    done();
                },
            });
        },

        watch: function (meta) {
            var block = meta.LessBlock;
            if (!block) {
                return;
            }


            block.on('change', function () {
                meta.expire('css');
                meta.emitter.fire('change');
            });

            block.watch();

        },

       


    };
    
});


