
/**
* 
*/
define('HtmlLink/Meta', function (require, module, exports) {
    var $ = require('$');
    var $String = $.require('String');

    return {

        create: function (config, others) {

            var meta = {
                'id': $String.random(),             //实例 id。
                'file': config.file,                //文件路径。
                'dir': '',                          //当前 html 片段页所在的目录，由下级模块 Parse 解析取得。
                'content': config.content || '',    //当前 html 片段的内容。
                'lines': [],                        //content 按行分裂的数组。
                'list': [],                         //下级实例列表。
                'old': {                            //重新解析前对一些字段的备份。
                    'file$link': {},                //
                },

                'file$link': {},                    //文件名对应的下级 Link 实例。    
                'key$output': {},                  //缓存 this.html(options) 输出。 key = JSON.stringify(options);

                '$': null,                          //cheerio 实例。
                'parent': config.parent || null,    //所属于的父节点。
                'this': null,                       //方便内部引用自身的实例。
                'emitter': null,                    //事件驱动器。
                'watcher': null,                    //Watcher 实例。


                'change': function (timeout) {
                    timeout ? setTimeout(change, timeout) : change();

                    function change() {
                        var emitter = meta.emitter;
                        emitter && emitter.fire('change');
                    }
                },


            };


            Object.assign(meta, others);
           

            return meta;
           
        },

        reset: function (meta) {
            meta.old.file$link = meta.file$link;

            Object.assign(meta, {
                'content': '',
                '$': null,
                'list': [],
                'lines': [],
                'file$link': {},
                'key$output': {},
            });
        },


    };
    
});


