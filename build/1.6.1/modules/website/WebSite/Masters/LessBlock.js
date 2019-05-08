
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

            //��·����ȫ��
            var name = options.name;

            //�� name �ֶβ�����·�������һ�� dest �ֶΡ�
            if (name) {
                options['dest'] = meta.cwd + meta.css + name;
            }

            return options;

        },

    };




});




