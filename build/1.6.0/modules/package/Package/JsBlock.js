
/**
* 
*/
define('Package/JsBlock', function (require, module, exports) {
    var $ = require('$');
    var $String = $.require('String');
    var JsBlock = require('JsBlock');
    var Path = require('Path');
    var File = require('File');
    var Query = $.require('Query');


    return exports = {
        /**
        * 
        * 根据路径模式，尽量复用以前的实例和输出结果。
        */
        create: function (meta) {
            var patterns = meta.patterns.js;
            var old = meta.old;
            var block = old.JsBlock;

            if (!patterns || !patterns.length) {
                block && block.destroy();
                old.JsBlock = null;
                return null;
            }


            var key0 = patterns.join();
            var key1 = old.patterns.js.join();

            //路径模式不变，则复用之前的(如果有)。
            if (key0 == key1 && block) {
                meta.type$output['js'] = old.type$output['js'];
                meta.compile['js'] = old.compile['js'];
                return block;
            }

            //路径模式不同，要新建。

            block = new JsBlock({
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
        *       begin: '',          //可选。 合并 js 的闭包头文件。
        *       end: '',            //可选。 合并 js 的闭包的尾文件。
        *       done: fn,           //编译完成后要执行的回调函数。
        *   };
        */
        compile: function (meta, options) {
            options = options || {};

            var done = typeof options == 'function' ? options : options.done;
            var block = meta.JsBlock;

            if (!block) {
                return done();
            }

            //先使用缓存。
            var key = JSON.stringify(options);
            var output = meta.compile['js'][key];

            if (output) {
                meta.type$output['js'] = output;   //引到用最近一次的。
                return done();
            }


            var info = block.concat({
                'minify': options.minify,
                'begin': options.begin,
                'end': options.end,

                'transform': function (content, data) {
                    var values = meta.emitter.fire('compile', 'js-block', [content, {
                        'name': meta.name,
                        'md5': data.md5,
                        'list': data.files,          //合并的源文件列表。
                    }]);

                    return values.slice(-1)[0];
                },
            });

            var content = info.content;
            var sample = meta.dest + options.name + '.js';

            var dest = $String.format(sample, {
                'name': meta.name,
                'md5': info.md5,
            });

            var href = Path.relative(meta.htdocs, dest);
            


            //有可能是空内容。
            var output = !content ? {} : {
                'dest': dest,
                'href': href,
                'md5': info.md5,
                'minify': options.minify,
            };

            meta.type$output['js'] = output;
            meta.compile['js'][key] = output;

            content && File.write(dest, content);  //有内容才写入。

            done();
        },


        /**
        * 
        */
        watch: function (meta) {
            var block = meta.JsBlock;
            if (!block) {
                return;
            }


            block.on('change', function () {
                meta.expire('js');
                meta.emitter.fire('change');
            });

            block.watch();

        },

       


    };
    
});


