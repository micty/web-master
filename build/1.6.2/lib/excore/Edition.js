

/**
* 管理如 `.debug.js` 和 `.min.js` 之类的后缀名。
* @namespace
* @name Edition
*/
define('Edition', function (require, module, exports) {
    var Path = require('Path');

    var debug = '.debug';
    var min = '.min';



    return exports = /**@lends Edition*/ {

        /**
        * 设置默认值。
        */
        config: function (config) {
            config = config || {};
            debug = config.debug || debug;
            min = config.min || min;
        },


        /**
        * 解析指定的文件路径。
        */
        parse: function (file) {
            var ext = exports.ext(file);
            var isDebug = ext.startsWith(debug);
            var isMin = ext.startsWith(min);

            return {
                'ext': ext,         //如 `.debug.js`、`.min.js` 或 `.js` 之类的。
                'debug': isDebug,   //是否为 debug 版。
                'min': isMin,       //是否为 min 版。
            };
        },



        /**
        * 获取带版本的后缀名。
        * 返回 `.debug.js`、`.min.js` 或 `.js` 之类的。
        */
        ext: function (file) {
            var ext = Path.ext(file);   //如 `.js`
            var debugExt = debug + ext; //如 `.debug.js`;
            var minExt = min + ext;     //如 `.min.js`

            return file.endsWith(debugExt) ? debugExt :
                file.endsWith(minExt) ? minExt :
                ext;
        },

        /**
        * 把文件名转成 min 版。
        * 如果不指定 force 为 true，则只有文件名中原本为 debug 版的才会转换。
        *   file = ''       //文件名。 如 `../htdocs/test.debug.js`
        *   force = false   //是否强制转换。 如果指定为 true，则不管 file 中是否为 debug 版，都会转成 min 版返回。                   
        */
        toMin: function (file, force) {
            var ext = Path.ext(file);   //如 `.js`
            var debugExt = debug + ext; //如 `.debug.js`;
            var minExt = min + ext;     //如 `.min.js`


            //把如 `.debug.js` 换成 `.min.js`。
            if (file.endsWith(debugExt)) {
                return file.slice(0, 0 - debugExt.length) + minExt; 
            }

            //把如 `.js` 换成 `.min.js`。
            if (force) {
                return file.slice(0, 0 - ext.length) + minExt;      
            }

            //原样返回。
            return file;

        },


    };

});
