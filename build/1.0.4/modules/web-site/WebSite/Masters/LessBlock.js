
/**
* 
*/
define('WebSite/Masters/LessBlock', function (require, module, exports) {


    var Path = require('Path');




    return {

        normalize: function (meta, options) {
            if (!options) {
                return options;
            }

            //短路径补全。
            var name = options.name;

            //把 name 字段补完整路径，添加一个 dest 字段。
            if (name) {
                options['dest'] = meta.cwd + meta.css + name;
            }

            return options;

        },

    };




});




