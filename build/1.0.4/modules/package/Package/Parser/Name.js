
/**
* 
*/
define('Package/Parser/Name', function (require, module, exports) {

    var Path = require('Path');
    var Patterns = require('Patterns');




    return {
        /**
        * 解析。
        *   options = {
                name: '',
                dir: '',
            };
        */
        get: function (options) {
            var name = options.name;
            if (name) {
                return name;
            }

            //如果未指定 name，则以包文件所在的目录的第一个 js 文件名作为 name。

            var dir = options.dir;
            var files = Patterns.getFiles(dir, '*.js');

            name = files[0];

            if (!name) {
                return;
            }

            name = Path.relative(dir, name);
            name = name.slice(0, -3); //去掉 `.js` 后缀。

            return name;



        },

    };
    
});


