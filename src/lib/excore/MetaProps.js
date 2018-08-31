

/**
* 元数据属性管理器。
* 解析 html 标签中 `data-meta="a=x1; b=x2; ..."` 这样的值为一个 object 结构：
*   meta = {
*       a: 'x1',
*       b: 'x2',
*       ...
*   };
*/
define('MetaProps', function (require, module, exports) {

    var key = 'data-meta';




    return exports = {

        /**
        * 解析指定的字符串值为一个对象。
        * 已重载 parse(props); //直接传入一个对象的情况。
        *
        *   每个键值对用分号 `;` 隔开，可以含有空格。
        *   键值对内的等号 `=` 前后也可以含有空格，会给 trim() 去掉。
        *   value = 'a=x1; b=x2; ...'; 
        *   返回一个解析后的对象 {}。
        */
        parse: function (value) {

            if (typeof value == 'object') {
                var props = value || {};
                value = props[key];
            }


            if (!value) {
                return {};
            }


            var list = value.split(';');
            var meta = {};

            list.forEach(function (item) {
                if (!item) {
                    return;
                }

                var a = item.split('=');

                var key = a[0].trim();
                var value = a[1].trim();

                meta[key] = value;
            });


            return meta;

        },

        /**
        * 与 parse 相反，把指定的对象字符串化。
        * 返回一个字符串，该串以分号 `;` 分隔每个键值对；健值对内的健和值用等号 `=` 分隔。
        */
        stringify: function (data) {
            var items = Object.keys(data).map(function (key) {
                return key + '=' + data[key];
            });

            return items.join('; ') + ';'; //最后一项以分号结束。
        },

        /**
        * 已重载 delete(value, keys);  //从指定的字符串值中删除特定的健项。
        * 已重载 delete(props);        //从指定的 props 中删除整个元数据键，返回一个新对象。
        */
        delete: function (value, keys) {
            //重载 delete(props);
            if (typeof value == 'object' || value === undefined) {
                var props = Object.assign({}, value);

                delete props[key];

                return props;
            }

            //重载 delete(value, keys);
            var data = exports.parse(value);

            keys.forEach(function (key) {
                delete data[key];
            });

            value = exports.stringify(data);
            return value;
        },
    };


});
