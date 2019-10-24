
/**
* 文件监控器类。
* @class
* @name Watcher
*/
define('Watcher', function (require, module, exports) {
    var Path = require('Path');
    var $ = require('$');
    var Patterns = require('Patterns');
    var Emitter = $.require('Emitter');
    var Meta = module.require('Meta');
    var Events = module.require('Events');

    var defaults = module.require('defaults');
    var mapper = new Map();


    /**
    * 构造器。
    * 已重载 Watcher(config);
    * 已重载 Watcher(patterns);
    * 已重载 Watcher(pattern);
    *   config = {
    *       patterns: [],   //要监控的文件路径模式列表。
    *   };
    */
    function Watcher(config) {
        if (Array.isArray(config)) {
            //重载 Watcher(patterns);
            config = { 'patterns': config, };
        }
        else if (typeof config == 'string') {
            //重载 Watcher(pattern);
            config = { 'patterns': [config], };
        }

        config = Object.assign({}, defaults, config);


        var meta = Meta.create(config, {
            'this': this,
            'emitter': new Emitter(this),
        });

        mapper.set(this, meta);

        Object.assign(this, {
            'id': meta.id,
            'meta': meta,
        });
       
        Events.bind(meta);

    }




    Watcher.prototype = {
        constructor: Watcher,


        /**
        * 绑定事件。
        * 已重载 on({...}); 批量绑定。
        * 已重载 on(name, fn); 单个绑定。
        */
        on: function (name, fn) {
            var meta = mapper.get(this);
            meta.emitter.on(...arguments);
        },

        /**
        * 设置新的监控文件列表。
        * 该方法会重新设置新的要监控的文件列表，之前的列表则不再监控。
        */
        set: function (dir, patterns) {
            var meta = mapper.get(this);
            var watcher = meta.watcher;
            var files = this.get();

            //先清空之前的
            files.forEach(function (file) {
                watcher.remove(file);
            });

            patterns = meta.patterns = Patterns.join(dir, patterns);
            watcher.add(patterns);
        },

        /**
        * 获取当前监控的文件和目录列表。
        */
        get: function () {
            var meta = mapper.get(this);
            var dir$files = meta.watcher.relative();
            var list = [];

            //先清空之前的
            Object.keys(dir$files).forEach(function (dir) {
                var files = dir$files[dir];

                files.forEach(function (file) {
                    file = Path.join(dir, file);
                    list.push(file);
                });
            });
            
            return list;
        },

        /**
        * 添加新的监控文件列表。
        * 该方法会在原来的列表基础上添加新的要监控的文件列表。
        */
        add: function (dir, patterns) {
            var meta = mapper.get(this);
            var watcher = meta.watcher;

            patterns = Patterns.join(dir, patterns);
            meta.patterns = [...new Set([...patterns, ...meta.patterns])]; //合并，去重。
            watcher.add(patterns);
        },

        /**
        * 从监控中列表中删除指定的文件。
        * 已重载 delete(file);         //删除一个文件。
        * 已重载 delete(patterns);     //删除指定模式的文件列表。
        */
        delete: function (patterns) {
            var meta = mapper.get(this);
            var files = Patterns.getFiles();

            //先清空之前的
            files.forEach(function (file) {
                meta.watcher.remove(file);
            });
        },

        /**
        * Unwatch all files and reset the watch instance.
        */
        close: function () {
            var meta = mapper.get(this);
            meta.watcher.close();
        },

        /**
        * 销毁本实例。
        */
        destroy: function () {
            var meta = mapper.get(this);

            meta.watcher.close();
            meta.emitter.destroy();
            meta.emitter = null;        //在 Events 子模块中用到。

            mapper.delete(this);
        },
    };



    //静态方法。
    Object.assign(Watcher, {
        /**
        * 
        */
        config: function (options) {
            Object.assign(defaults, options);
        },

        /**
        * 
        */
        log: function () {
            var name = defaults.name;

            if (name) {
                console.log('>>'.cyan, `${name}`.bgGreen, `watching...`);
            }
            else {
                console.log('>>'.cyan, `watching...`);
            }

        },
    });


    return Watcher;

    

});




