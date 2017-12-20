

/**
* 把文本分裂成行的工具。
*/
define('Lines', function (require, module, exports) {

    var $ = require('$');
    var $String = $.require('String');
    var seperator = '\r\n';



    return exports = {
        /**
        * 
        */
        'seperator': seperator,

        /**
        * 把文本内容分裂成行的数组。
        * 方法可以确保内容是完全按行分裂的。
        * 已重载 split(lines); 传入一个行的数组。
        * 已重载 split(content); 传入一个字符作为内容。
        */
        'split': function (content) {

            //如果传入一个行的数组，先 join 一次再分裂，以确保数组元素中的内容也能得到分裂。
            if (Array.isArray(content)) {
                content = exports.join(content);
            }

            //在某些操作系统下，换行符不一致时会出错，这里统一替换成 `\n`
            content = content.split('\r\n').join('\n');
            content = content.split('\r').join('\n');

            var lines = content.split('\n');

            return lines;
        },

        /**
        * 
        */
        'join': function (lines) {
            if (!Array.isArray(lines)) {
                return String(lines);
            }

            //过滤掉 null 或 undefined 的项。
            lines = lines.filter(function (line) {
                return !(line == null);
            });

            return lines.join(seperator);
        },


        /**
        * 查找指定字符串在行列表中所在的索引值(行号)。
        * 已重载 getIndex(content, string);
        */
        'getIndex': function (lines, string, startIndex) {
            if (!Array.isArray(lines)) {
                lines = exports.split(lines);
            }

            startIndex = startIndex || 0;

            var len = lines.length;

            for (var i = startIndex; i < len; i++) {
                var item = lines[i];

                if (item.includes(string)) {
                    return i;
                }
            }

            ////这样写为了更容易发现 bug，以防万一。
            //throw Error('无法找到所在 index!');

            return -1;
        },

        /**
        * 获取指定字符串在行列表中所在的行的整行内容。
        * 已重载 getLine(content, string);
        */
        'getLine': function (lines, string) {
            if (!Array.isArray(lines)) {
                lines = exports.split(lines);
            }

            var item = lines.find(function (line) {
                return line.includes(string);
            });

            return item || '';
        },

        /**
        * 要所有的行前面填充指定数目的字符串。
        * 已重载 pad(lines, replacer, count);
        * 已重载 pad(content, replacer, count);
        * 已重载 pad(content, count);
        * 已重载 pad(lines, count);
        */
        'pad': function (lines, replacer, count) {
            var isArray = Array.isArray(lines);
     
            lines = exports.split(lines); //确保是完全按行分裂的。

            //重载 pad(lines, count)
            //重载 pad(content, count)
            if (typeof replacer == 'number') {
                count = replacer;
                replacer = '';
            }

            replacer = replacer || ' ';
            count = count || 0;
            count = count * replacer.length;
            
            lines = lines.map(function (line) {
                var total = line.length + count;

                line = line.padStart(total, replacer);

                return line;
            });

            return isArray ? lines : exports.join(lines);

        },

        /**
        * 
        */
        'stringify': function (lines, replacer, count) {

            var content = exports.join(lines);
            content = exports.pad(content, replacer, count);

            return content;
        },
        
        /**
        * 把行数组中指定的片段替换成目标内容，同时保持行数组的长度不变。
        */
        'replace': function (lines, beginIndex, endIndex, target) {
            for (var i = beginIndex; i <= endIndex; i++) {
                lines[i] = null;    //先用 null 占位。
            }

            lines[beginIndex] = target;
        },

        /**
        * 判断所在的行是否给注释掉了。
        */
        'commented': function (line, item) {
            return $String.between(line, '<!--', '-->').includes(item);
        },

        /**
        * 统计指定内容中的行数和最大列数。
        */
        'stat': function stat(content) {

            var lines = exports.split(content);

            var x = 0;
            var y = 0;
            var no = 0;


            lines.forEach(function (line, index) {

                var s = line.trim();        //移除前后空格后。

                if (!s ||                   //没内容。
                    s.startsWith('//') ||   //以 `//` 开始的注释，在单行注释里。
                    s.startsWith('/*') ||   //以 `/*` 开始的注释，在多行注释里。
                    s.startsWith('*')) {    //以 `*` 和 `*/` 开始的注释，在多行注释里。

                    return;
                }


                y++;

                var len = line.length;
                if (len > x) {
                    x = len;
                    no = index;
                }
            });


            return {
                'x': x,             //最长的一行的长度。           
                'y': y,             //有效的行数，即去掉空行、注释行后的行数。
                'y0': lines.length, //原始行数。
                'no': no + 1,       //最最长的一行所在的行号，从 1 开始。
            };
        },


    };



});




