
/**
* 获取块中的详细信息。
*/
define('BlockList/Item', function (require, module, exports) {

    var Lines = require('Lines');
    

    return {

        /**
        * 
        */
        get: function (lines, tags, start) {
            var begin = Lines.getIndex(lines, tags.begin, start);

            if (begin < 0) { //没有找到开始标记。
                return;
            }

            //找到开始标记。

            start = begin + 1;

            var end = Lines.getIndex(lines, tags.end, start);

            if (end < 0) { //没有找到结束标记。
                return;
            }


            lines = lines.slice(begin, end + 1);

            var tabs = lines[0].indexOf(tags.begin);      //以首行的开始标记为准，取得前导空格数。
            var contents = lines.slice(1, -1);
            var content = Lines.join(contents);

            return {
                'begin': begin,
                'end': end,
                'tabs': tabs,
                'tags': tags,
                'lines': lines,
                'content': content,
            };
        },
    };

});




