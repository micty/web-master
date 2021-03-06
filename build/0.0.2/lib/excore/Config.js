/**
* 配置工具类。
* @class
* @name Config
*/
define('Config', function (require, module,  exports) {

    var $ = require('$');
    var $Object = $.require('Object');

    var mapper = new Map();


    /**
    * 构造器。
    */
    function Config() {

        var meta = {
            'name$config': {},
            'name$formatted': {},
        };

        mapper.set(this, meta);
    }

    //实例方法
    Config.prototype = /**@lends Config#*/ {
        constructor: Config,

        /**
        * 设置指定模块的默认配置。
        * 已重载 set({...})，因此可以批量设置。
        * @param {string} name 要设置的模块的名称。
        * @param {Object} config 要设置的默认配置对象。
        */
        set: function (name, config) {

            var meta = mapper.get(this);
            var name$config = meta.name$config;
            var name$formatted = meta.name$formatted;

            if (typeof name == 'object') { //批量设置: set({...})
                $Object.each(name, function (name, config) {
                    setItem(name, config);
                });
            }
            else { //单个设置 set(name, config)
                setItem(name, config);
            }
            

            //内部共用方法，设置单个模块的默认配置对象。
            function setItem(name, config) {

                var obj;

                if (name in name$config) {
                    obj = name$config[name];
                    if ($Object.isPlain(obj)) { //纯对象
                        obj = Object.assign(obj, config); //则合并
                    }
                    else { //其他的，则重设
                        obj = name$config[name] = config;
                    }
                }
                else { //首次设置
                    obj = name$config[name] = config;
                }


                //第一次或重新设置了 config，让其 formatted 指示已失效
                name$formatted[name] = false;

                return obj;
            }

        },



        /**
        * 获取指定模块名称的默认配置。
        * @param {string|object} name 要获取的模块的名称。
        *   或者传入 module 对象，会读取其 id。
        * @return {Object} 返回该模块的默认配置对象。
        */
        get: function (name) {

            var meta = mapper.get(this);
            var name$config = meta.name$config;
            var name$formatted = meta.name$formatted;

            if (typeof name == 'object') { // 重载 get(module)
                name = name.id;
            }

            var config = name$config[name];

            if (!$Object.isPlain(config)) { //非纯对象，直接返回即可
                return config;
            }

            //这个模块特殊，不用也不能转换，否则会构成 require 死循环。
            if (name == 'Url') { 
                return config;
            }

            var formatted = name$formatted[name];

            if (!formatted) { //该模块的配置对象里尚未格式化 url，

                var Data = module.require('Data');
                config = Data.format(config);

                name$config[name] = config; //回写
                name$formatted[name] = true;
            }

            return config;
        },

        /**
        * 获取并克隆指定模块名称的默认配置。
        * @param {string} name 要获取的模块的名称。
        * @param {Object} [target] 需要合并的对象。
        *   如果需要提供额外的合并成员，可指定此参数。
        * @return {Object} 返回该模块的默认配置对象的克隆版本。
        */
        clone: function (name, target, target1, targetN) {
            var config = this.get(name);

            var args = [].slice.call(arguments, 1);
            args = [{}, config].concat(args);

            return $Object.extendDeeply.apply(null, args);

        },

    };


    return Config;

   
});

