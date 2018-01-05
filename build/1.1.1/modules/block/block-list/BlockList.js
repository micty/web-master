
/**
* 
*/
define('BlockList', function (require, module, exports) {

    var Lines = require('Lines');
    var Path = require('Path');
    var Item = module.require('Item');
    var Patterns = module.require('Patterns');


    return {

        /**
        * 解析。
        * 已重载 parse(lines, options);   //传入一个行数组作为内容。
        * 已重载 parse(content, options); //传入一个字符串作为内容。
        *   options = {
        *       begin: '',          //区块的开始标记。 如 `<!--weber.less.begin-->`。
        *       end: '',            //区块的结束标记。 如 `<!--weber.less.end-->`。
        *       type: 'patterns',   //返回结果要解析成的数据类型。 如果指定为 `patterns` 或不指定，则解析成一个路径的模式数组。 
        *   };
        */
        parse: function (lines, options) {
            if (!Array.isArray(lines)) {
                lines = Lines.split(lines);
            }

            var list = [];
            var start = 0;
            var item = null;
            var type = options.type || 'patterns';

            var tags = {
                'begin': options.begin,
                'end': options.end,
            };


            do {
                item = Item.get(lines, tags, start);

                if (!item) {
                    break;
                }

                start = item.begin + 1;

                if (type == 'patterns') {
                    item.patterns = Patterns.get(item.lines);
                }

                list.push(item);

            } while (item);


            return list;

        },

        /**
        * 高亮显示指定区块中的某个文件所在的行。
        * 主要用于检测到区块中某个文件不存在时，高亮显示所在的行。
        * 参数:
        *   lines: [],  //全部内容的行数组。
        *   item: {},   // parse() 方法返回的 list 数组中的项。
        *   file: '',   //短文件名。 如 `index.js`。
        */
        highlight: function (lines, item, file) {
            var has = item.patterns.includes(file);

            if (!has) {
                return;
            }

            var no = item.lines.findIndex(function (line) {
                line = line.trim();

                return line.startsWith("'" + file + "'") || 
                    line.startsWith('"' + file + '"');
            });


            //no 不可能为 0，因为 item.lines[0] 为开始标记。
            if (no < 1) {
                return;
            }


            no = no + item.begin;
            Lines.highlight(lines, no);

        },
    };

});




