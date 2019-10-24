
/**
* 
*/
define('WebSite/Masters/JsBlock', function (require, module, exports) {
    var Path = require('Path');




    return {

        normalize: function (cwd, options) {
            if (!options) {
                return options;
            }


            //��·����ȫ��
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




