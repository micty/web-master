
/**
* 
*/
define('LogicHtml/Meta', function (require, module, exports) {

    var $ = require('$');
    var $String = $.require('String');
    var Patterns = require('Patterns');


    return {

        create: function (config, others) {
            var dir = config.dir;
            var patterns = config.patterns;

            patterns = Patterns.join(dir, patterns);

            var meta = {
                'id': $String.random(),     //实例 id。
              
                'dir': dir,                 //相对目录。
                'patterns': patterns,       //原始的路径模式。

                'this': null,               //方便内部引用自身的实例。
                'emitter': null,            //事件驱动器。
                'watcher': null,            //Watcher 实例。

                'file$html': {},            //
                'key$files': {},            //
            };


            Object.assign(meta, others);
           

            return meta;
           
        },


    };
    
});


