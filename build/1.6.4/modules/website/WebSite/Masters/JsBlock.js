
/**
* 
*/
define('WebSite/Masters/JsBlock', function (require, module, exports) {
    var Path = require('Path');




    return {

        normalize: function (meta, options) {

            options = Object.assign({}, options, {

                //让外界有机会对合并后的 js 内容进行转换(如 babel)。
                'transform': function (content, data) {
                    var args = [...arguments];
                    var values = meta.emitter.fire('build', 'js-block', args);
                    return values.slice(-1)[0];
                },
            });


            //短路径补全。
            var cwd = meta.cwd;
            var begin = options.begin;
            var end = options.end;

            if (begin) {
                options.begin = cwd + begin;
            }

            if (end) {
                options.end = cwd + end;
            }

            return options;

        },

    };




});




