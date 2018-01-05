
/**
* 
*/
define('HtmlBlock/Meta', function (require, module, exports) {

    var $ = require('$');
    var $String = $.require('String');
    var Patterns = require('Patterns');


    return {

        create: function (config, others) {
            var dir = config.dir;
            var patterns = config.patterns;
            var excludes = config.excludes || [];
            var tid = null;

            excludes = excludes.slice(0);               //因要用于检测，复制一份，免得给外部无意中修改。
            patterns = Patterns.join(dir, patterns);

            var meta = {
                'id': $String.random(),             //实例 id。
              
                'dir': dir,                         //相对目录。
                'patterns': patterns,               //原始的路径模式。
                'excludes': excludes,               //要排除的模式列表。 里面饱含完整的目录，与字段 dir 无关。
                'this': null,                       //方便内部引用自身的实例。
                'emitter': null,                    //事件驱动器。
                'watcher': null,                    //Watcher 实例。

                'file$link': {},                    //文件名对应的下级 HtmlLink 实例。   

                'old': {                            //重新解析前对一些字段的备份。
                    'file$link': {},                //文件名对应的下级 HtmlLink 实例。  
                },

                'list': [],                         // item = { file, link, isOld, };
                'contents': [],                     //file 对应的内容的占位符。

                //timeout 让一定时间内的多次 change 事件只会触发一次。
                'change': function (timeout) {
                    if (timeout) {
                        clearTimeout(tid);
                        tid = setTimeout(change, timeout);
                    }
                    else {
                        change();
                    }

                    function change() { 
                        meta.emitter && meta.emitter.fire('change');
                    }
                },
            };


            Object.assign(meta, others);
           

            return meta;
           
        },

        reset: function (meta) {
            meta.old.file$link = meta.file$link;

            Object.assign(meta, {
                'file$link': {},
                'list': [],                         // item = { file, link, isOld, };
                'contents': [],                     //file 对应的内容的占位符。
            });
        },


    };
    
});


