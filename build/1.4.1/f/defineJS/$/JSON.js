
/**
* JSON 工具类
* @class
* @name JSON
*/
define('JSON', function (require, module,  exports) {

    var JSON = window.JSON;

    module.exports = exports = /**@lends JSON*/ {

        /**
        * 把一个 JSON 字符串数据解析成对象。
        */
        parse: function (data) {

            try {
                return JSON.parse(data);
            }
            catch (ex) {
            }

            try {
                data = data.replace(/^(\r\n)+/g, '');
                return (new Function('return ' + data))();
            }
            catch (ex) {
            }

            return null;

        },

    };

});


