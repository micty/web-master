﻿
/**
* 
*/
define('LessLink/Meta', function (require, module, exports) {
    var $ = require('$');
    var $String = $.require('String');


    return {

        create: function (config, others) {

            var meta = {
                'id': $String.random(),         //实例 id。
                'file': config.file,           //输入的源 less 文件路径，是一个 string。

                'this': null,                   //方便内部引用自身的实例。
                'emitter': null,                //事件驱动器。
                'watcher': null,                //Watcher 实例。

                'output': {                     //编译后的输出信息。
                    'css': '',
                    'md5': '',
                    'dest': '',
                },               

            };

            Object.assign(meta, others);

            return meta;
           
        },

    };
    
});


