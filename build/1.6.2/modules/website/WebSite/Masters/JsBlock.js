
/**
* 
*/
define('WebSite/Masters/JsBlock', function (require, module, exports) {
    var Path = require('Path');




    return {

        normalize: function (meta, options) {

            options = Object.assign({}, options, {

                //������л���Ժϲ���� js ���ݽ���ת��(�� babel)��
                'transform': function (content, data) {
                    var args = [...arguments];
                    var values = meta.emitter.fire('build', 'js-block', args);
                    return values.slice(-1)[0];
                },
            });


            //��·����ȫ��
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




