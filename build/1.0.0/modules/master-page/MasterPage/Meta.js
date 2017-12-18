
/**
* 
*/
define('MasterPage/Meta', function (require, module, exports) {

    var $ = require('$');
    var $String = $.require('String');
    var Path = require('Path');
    var Lines = require('Lines');
    var File = require('File');





    return {
        /**
        * 
        */
        create: function (config, others) {
            var file = config.file;         //如 `../htdocs/test/index.master.html`。
            var dest = config.dest;         //如 `{name}.html`。
            var dir = Path.dir(file);       //如 `../htdocs/test/`。
            var name = Path.base(file);     //如 `index.master`。
            var excludes = config.excludes || {};   //需要排除的模式。

            name = Path.base(name);         //如 `index`。
            dest = dir + dest;              //如 `../htdocs/test/{name}.html`。
            dest = $String.format(dest, { 'name': name, }); //如 `../htdocs/test/index.html`。


            var meta = {
                'id': $String.random(),     //实例 id。
                'name': name,               //短名称。
                'file': file,               //当前母版页的文件路径。
                'dir': dir,                 //当前母版页所在的目录。
                'dest': dest,               //输出的目标页面的路径。
                'htdocs': config.htdocs,    //网站的根目录。
                'css': config.css,          //样式目录，相对于网站的根目录，如 `style/css/`。

             

                'this': null,               //方便内部引用自身的实例。
                'emitter': null,            //事件驱动器。
                'watcher': null,            //Watcher 实例。
                'link': null,               //当前母版页对应的 HtmlLink 实例。


                'content': '',              //当前母版页的内容。
                'lines': [],                //content 按行分裂的数组。

                'CssLinks': [],             //静态的 css 引用列表。
                'LessLinks': [],            //静态的 less 引用列表。
                'HtmlLinks': [],            //静态的 html 引用列表。
                'JsLinks': [],              //静态的 js 引用列表。

                'LessBlocks': [],           //LessBlock 实例列表，即动态的 less 引用列表。
                'HtmlBlocks': [],           //HtmlBlock 实例列表，即动态的 html 引用列表。
                'JsBlocks': [],             //JsBlock 实例列表，即动态的 js 引用列表。

                //
                'css$link': {},             //css 文件名对应的 CssLink 实例。
                'less$link': {},            //less 文件名对应的 LessLink 实例。
                'js$link': {},              //js 文件名对应的 JsLink 实例。

                'patterns$HtmlBlock': {},   //路径模式对应的的 HtmlBlock 实例。
                'patterns$LessBlock': {},   //路径模式对应的的 LessBlock 实例。
                'patterns$JsBlock': {},     //路径模式对应的的 JsBlock 实例。

                //
                'excludes': {
                    'less': excludes.less || [],    //
                    'html': excludes.html || [],    //
                    'js': excludes.js || [],        //
                },

                //
                'old': {                    //重新解析前对一些字段的备份。
                    'css$link': {},             //css 文件名对应的 CssLink 实例。
                    'less$link': {},            //less 文件名对应的 LessLink 实例。
                    'js$link': {},              //js 文件名对应的 JsLink 实例。

                    'patterns$HtmlBlock': {},   //路径模式对应的的 HtmlBlock 实例。
                    'patterns$LessBlock': {},   //路径模式对应的的 LessBlock 实例。
                    'patterns$JsBlock': {},     //路径模式对应的的 JsBlock 实例。
                },


                'mix': function (timeout) {
                    if (!timeout) {
                        return meta.this.render();
                    }

                    clearTimeout(meta.mix.tid);

                    meta.mix.tid = setTimeout(function () {

                        meta.this.render({
                            'minify': false,
                            'dest': true,
                        });

                    }, timeout);
                    
                },

                //timeout 让一定时间内的多次 change 事件只会触发一次。
                'change': function (timeout) {
                    if (timeout) {
                        clearTimeout(meta.change.tid);
                        meta.change.tid = setTimeout(change, timeout);
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

        /**
        * 
        */
        reset: function (meta) {
            meta.old.less$link = meta.less$link;
            meta.old.js$link = meta.js$link;
            meta.old.patterns$HtmlBlock = meta.patterns$HtmlBlock;
            meta.old.patterns$LessBlock = meta.patterns$LessBlock;
            meta.old.patterns$JsBlock = meta.patterns$JsBlock;

            Object.assign(meta, {
                'content': '',              //当前母版页的内容。
                'lines': [],                //content 按行分裂的数组。

                'css$link': {},             //css 文件名对应的 CssLink 实例。
                'less$link': {},            //less 文件名对应的 LessLink 实例。
                'js$link': {},              //js 文件名对应的 JsLink 实例。

                'patterns$HtmlBlock': {},   //路径模式对应的的 HtmlList 实例。
                'patterns$LessBlock': {},   //路径模式对应的的 LessList 实例。
                'patterns$JsBlock': {},     //路径模式对应的的 JsList 实例。
            });

        },


    };
    
});


