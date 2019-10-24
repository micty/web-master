
/**
* 
*/
define('CssLink/Meta', function (require, module, exports) {
    var $ = require('$');
    var $String = $.require('String');
    var Url = require('Url');


    return {

        create: function (config, others) {
            var file = config.file;
            var external = Url.checkFull(file);

            var meta = {
                'id': $String.random(),         //实例 id。
                'file': file,                   //输入的源 css 文件路径，是一个 string。
                'external': external,           //是否为外部地址。

                'this': null,                   //方便内部引用自身的实例。
                'emitter': null,                //事件驱动器。
                'watcher': null,                //Watcher 实例。
            };


            Object.assign(meta, others);
           

            return meta;
           
        },

    };
    
});


