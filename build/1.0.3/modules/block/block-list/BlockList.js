
/**
* 
*/
define('BlockList', function (require, module, exports) {

    var Lines = require('Lines');
    var Item = module.require('Item');
    var Patterns = module.require('Patterns');


    return {

        /**
        * 解析。
        * 已重载 parse(lines, tags);   //传入一个行数组作为内容。
        * 已重载 parse(content, tags); //传入一个字符串作为内容。
        */
        parse: function (lines, tags) {
            if (!Array.isArray(lines)) {
                lines = Lines.split(lines);
            }

            var list = [];
            var start = 0;
            var item = null;


            do {
                item = Item.get(lines, tags, start);

                if (!item) {
                    break;
                }

                start = item.begin + 1;
                item.patterns = Patterns.get(item.lines);
                list.push(item);

            } while (item);


            return list;

        },
    };

});




