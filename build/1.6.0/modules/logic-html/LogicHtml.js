
/**
* 动态引用 html 资源文件。
*/
define('LogicHtml', function (require, module, exports) {
    var $ = require('$');
    var Emitter = $.require('Emitter');
    var $String = $.require('String');
    var $Object = $.require('Object');
    var Lines = require('Lines');
    var MD5 = require('MD5');
    var Html = require('Html');
    var Patterns = require('Patterns');
    var File = require('File');
    var Log = require('Log');

    var Meta = module.require('Meta');
    var Parser = module.require('Parser');
    var Watcher = module.require('Watcher');

    var mapper = new Map();


    /**
    * 构造器。
    *   options = {
    *       patterns: [],   //路径模式列表。
    *       dir: '',        //路径模式中的相对目录，即要解析的页面所在的目录。 如 `../htdocs/html/test/`。
    *   };
    */
    function LogicHtml(config) {
        config = Object.assign({}, config);

        var emitter = new Emitter(this);

        var meta = Meta.create(config, {
            'this': this,
            'emitter': emitter,
        });

        mapper.set(this, meta);

        Object.assign(this, {
            'id': meta.id,
            'data': {},         //用户自定义数据容器。
                
        });
    }

    //实例方法。
    LogicHtml.prototype = {
        constructor: LogicHtml,

        data: {},

        /**
        * 解析。
        */
        parse: function () {
            var meta = mapper.get(this);
            var files = Patterns.getFiles(meta.patterns);

            files.forEach(function (file) {
                if (file in meta.file$html) {
                    return;
                }

                meta.this.addFile(file);
            });

        },

        /**
        * 添加一个文件。
        */
        addFile: function (file) {
            var meta = mapper.get(this);
            var html = File.read(file);
            var keys = [];  //收集受影响的 key。

            meta.file$html[file] = html;

            //扫描所有已注册的 key，重新建立映射关系。
            $Object.each(meta.key$files, function (key, files) {
                if (!html.includes(key)) { //html 内容中是否包含特征串。
                    return;
                }


                if (files.length > 0) {
                    console.error('添加文件错误，以下文件都含有特征内容: ', key);
                    Log.logArray([...files, file], 'yellow');
                    throw new Error();
                }

                files.push(file);
                keys.push(key);
            });


            return keys;
        },

        deleteFile: function (file) {
            var meta = mapper.get(this);
            delete meta.file$html[file];

            $Object.each(meta.key$files, function (key, files) {
                var index = files.indexOf(file);
                if (index < 0) {
                    return;
                }

                files.splice(index, 1);
            });
        },

        /**
        * 添加一个特征串。
        */
        addKey: function (key) {
            var meta = mapper.get(this);
            var files = meta.key$files[key] = [];

            //扫描所有的 html 内容，重新建立映射关系。
            $Object.each(meta.file$html, function (file, html) {
                if (html.includes(key)) {
                    files.push(file);
                }
            });

            if (files.length > 1) {
                console.error('添加特征串错误，以下文件都含有特征内容: ', key);
                Log.logArray(files, 'yellow');
                throw new Error();
            }

            return files;

        },


        /**
        * 获取指定特征串对应的文件名。
        */
        get: function (key) {
            var meta = mapper.get(this);
            var files = meta.key$files[key];

            //该 key 尚未注册。
            if (!files) {
                this.parse();
                files = this.addKey(key);
                return files[0] || '';
            }

            //该 key 已注册。
            var file = files[0];

            //关联的文件记录已给删除。
            if (!file) {
                this.parse();
                files = this.addKey(key);
                return files[0] || '';
            }


            //this.deleteFile(file);

            this.parse();
            files = this.addKey(key);
            return files[0] || '';

        },



        /**
        * 监控当前引用文件和下级列表的变化。
        */
        watch: function () {
            var meta = mapper.get(this);
            if (meta.watcher) {
                return;
            }

            meta.watcher = Watcher.create(meta);
        },

        /**
        * 绑定事件。
        */
        on: function (name, fn) {
            var meta = mapper.get(this);
            meta.emitter.on(...arguments);
        },


        /**
        * 销毁当前对象。
        */
        destroy: function () {
            var meta = mapper.get(this);
            if (!meta) { //已销毁。
                return;
            }

            meta.emitter.destroy();
            meta.watcher && meta.watcher.destroy();
            mapper.delete(this);
        },

    };
        




    //静态方法。
    Object.assign(LogicHtml, {
        
    });

    return LogicHtml;



});




