
/**
* 
*/
define('MasterBlock/Meta', function (require, module, exports) {
    var $ = require('$');
    var $String = $.require('String');
    var Patterns = require('Patterns');


    return {

        create: function (config, others) {
            var tid = null;
            var htdocs = config.htdocs;
            var patterns = config.patterns || [];

            if (!Array.isArray(patterns)) {
                patterns = [patterns];
            }

            patterns = Patterns.join(htdocs, patterns);
            

            var meta = {
                'id': $String.random(),             //实例 id。
              
                'htdocs': htdocs,                   //网站的根目录。
                'css': config.css,                  //样式目录，相对于网站根目录。
                'dest': config.dest,                //输出的目标页面的名称模板。
                'patterns': patterns,               //路径模式。
                'excludes': config.excludes,        //用于传递给 MasterPage 实例。 要排除的模式。 

                'this': null,                       //方便内部引用自身的实例。
                'emitter': null,                    //事件驱动器。
                'watcher': null,                    //Watcher 实例。

                'list': [],                         // item = { file, master, isOld, };
                'file$master': {},                  //文件名对应的 MasterPage 实例。   
                'name$output': {},                  //包名对应的输出结果。

                'old': {                            //重新解析前对一些字段的备份。
                    'file$master': {},              //文件名对应的下级 MasterPage 实例。  
                    'name$output': {},              //包名对应的输出结果。
                },


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

            //
            Object.assign(meta.old, {
                'file$master': meta.file$master,                    
                'name$output': meta.name$output, 
            });

            Object.assign(meta, {
                'list': [],                         // item = { file, link, isOld, };
                'file$master': {},                  //文件名对应的 MasterPage 实例。   
                'name$output': {},                  //包名对应的输出结果。
            });
        },


    };
    
});


