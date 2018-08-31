
/**
* 验证器。
*/
define('MasterPage/Validater', function (require, module, exports) {
    var $ = require('$');
    var $Object = $.require('Object');
    var Lines = require('Lines');


    return {
        /**
        * 检查 html 内容中的 id 是否存在重复使用。 
        */
        checkIds: function (html) {
            var regexp = /\s+id\s*=\s*["'][\s\S]*?["']/ig;
            var list = html.match(regexp);
            
            if (!list) { //没有匹配到 id。
                return;
            }


            var invalid = false;
            var lines = Lines.split(html);
            var id$items = {};

            list.forEach(function (item) {
                //如 item 为 ` id="div-main-home"`，具体的 id。
                //如 item 为 ` id="{footerId}"`，用于模板填充的 id。
                var pairs = item.split(/\s+id\s*=\s*/i);
                var id = pairs[1].slice(1, -1); 

                //包含 `{` 和 `}`，可能是模板中的 id，忽略掉。
                if (id.includes('{') && id.includes('}')) {
                    return;
                }

                var items = id$items[id] = id$items[id] || [];
                items.push(item);
            });


            $Object.each(id$items, function (id, items) {
                var length = items.length;
                if (length < 2) {
                    return;
                }

                invalid = true;
                length = length.toString();
                console.error('使用重复的 id: '+ id + ' ' + length + ' 次');

                var htmls = [];

                //去重。
                items = [...new Set(items)];

                items.forEach(function (item) {

                    lines.forEach(function (line, no) {
                        if (!line.includes(item)) {
                            return;
                        }

                        //line = line.trim();
                        line = line.split(id).join(id.bgMagenta); //高亮 id 的值部分。
                        no = no + 1;
                        htmls.push((no + ':').cyan + line);
                    });

                });

                console.log(htmls.join('\r\n'));
                console.log('');

            });

            return invalid;


        },


    };

});


