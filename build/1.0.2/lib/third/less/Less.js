
/**
* 对第三方库 less 的封装。
*/
define('Less', function (require, module, exports) {

    var $ = require('$');
    var $String = $.require('String');
    var File = require('File');
    var FileRefs = require('FileRefs');
    var MD5 = require('MD5');
    var less = require('less');
    var fs = require('fs');

    var md5$debug = {}; //记录 debug 版的信息
    var md5$min = {};   //记录 min 版的信息




    return exports = {

        /**
        * 修正 calc(express) 中的表达式计算，避免 less 引擎错误处理。
        *
        * 在 less 引擎编译 less 内容时，会对 calc(express) 中的表达式进行计算。
        * 例如，原内容为 { width: calc(100% - 67px); }，如果不处理，
        * 则 less 编译后为 { width: calc(33%); }，这并不是我们想要的结果。
        * 通过本方法先把原内容变为 { width: calc(~"100% - 67px"); }
        * 则编译后就是我们想要的 { width: calc(100% - 67px); }
        * 即把 calc(express) 中的 express 提取出来，变为 ~"express" 即可。 
        */
        fix: function (content) {
            var list = content.match(/calc\([\s\S]*?\);/g);

            //没有要处理的规则。
            if (!list || list.length == 0) {
                return content;
            }

            list.map(function (oldS) {
                var value = $String.between(oldS, 'calc(', ');');

                if (!value) {
                    return;
                }

                //已经是 calc(~"express"); 的结构。
                if (value.startsWith('~"') &&
                    value.endsWith('"')) {
                    return;
                }

                var newS = 'calc(~"' + value + '");';

                content = content.split(oldS).join(newS);
            });

            return content;
        },



        /**
        * 编译 less。
        *   options = {
        *       content: '',        //输入的 less 内容。
        *       src: '',            //输入的 less 源文件路径。
        *       dest: '',           //输出的 css 目标文件路径。
        *       minify: false,      //是否压缩，默认为 false。
        *       overwrite: true,    //是否覆盖目标 css 文件。 当未指定时，则默认为覆盖写入。
        *       delete: false,      //编译完成后是否删除 less 源文件(仅从引用计数上删除)。
        *       done: fn,           //编译成功完成后要执行的回调函数。
        * };
        */
        compile: function (options) {
            var src = options.src;              //less 
            var dest = options.dest;
            var minify = !!options.minify;      
            var overwrite = options.overwrite == null ? true : !!options.overwrite; //当未指定时，则默认为覆盖写入。
            var existed = dest ? fs.existsSync(dest) : false;   
            var md5$css = minify ? md5$min : md5$debug;
            var content = options.content || File.read(src);   //less 内容。
            var md5 = MD5.get(content);     //less 内容对应的 md5。
            var cache = md5$css[md5];       //less 内容对应的缓存 css。


            //指定了要写入目标 css 文件，并且已经存在 css 文件。
            if (existed) {
                var css = File.read(dest);

                if (cache == css) { //要编译生成的 css 与之前存在的一致
                    //console.log('使用缓存'.bgGreen, dest.gray);
                    return done(css);
                }
            }

            //cache 可能为空内容。
            if (md5 in md5$css) {
                //src && console.log('使用缓存'.bgMagenta, src.gray);
                return done(cache, dest);
            }



            //首次编译。
            //详见: http://lesscss.org/usage/#programmatic-usage
            content = exports.fix(content);


            less.render(content, { 'compress': minify, }, function (error, output) {
                if (error) {
                    console.log('less 编译错误:'.bgRed, error.message.bgRed);
                    src && console.log('所在文件: '.bgMagenta, src.bgMagenta);
                    console.log(error);
                    throw error;
                }


                var css = output.css;  // css可能为空内容。

                //非压缩版本，则重新美化一下格式。
                //less 输出的 css 是 2 个空格缩进的，这里换成 4 个空格。
                if (!minify) {
                    css = css.split('\n  ').join('\r\n    ');
                }

                md5$css[md5] = css;

                if (src) {
                    console.log('编译'.green, src.cyan);

                    if (!css) {
                        console.log('编译后的 css 内容为空'.bgRed, src.bgYellow);
                    }
                }


                done(css, dest);
            });


            //内部的共用方法，执行最后的操作。
            function done(css, dest) {
                var deleted = options.delete;                   //是否需要删除源 less 文件。               
                var writed = dest && (overwrite || !existed);   //是否需要写入目标 css 文件。
                var done = options.done;                        //完成后的回调函数。
                var md5 = MD5.get(css);                         //生成的 css 对应的 md5 值。


                deleted && FileRefs.delete(src);
                writed && File.write(dest, css);      //写入 css 文件
                done && done(css, md5);

            }
           
        },





    };

});




