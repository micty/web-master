
/**
* 
*/
define('JsLink/Parser', function (require, module, exports) {
    var $ = require('$');
    var Path = require('Path');
    var Lines = require('Lines');
    var cheerio = require('cheerio');
    var Url = require('Url');
    var MetaProps = require('MetaProps');
    var Edition = require('Edition');



    return {


        /**
        * 从指定的 html 内容中解析出 `<script src="xx"></script>` 的标签列表信息。
        *   options = {
        *       dir: '',    //script 标签里的 src 属性相对的目录，即要解析的页面所在的目录。
        *   };
        */
        parse: function (content, options) {
            //提取出引用了 js 文件的 script 标签。
            var regexp = /<script\s+.*src\s*=\s*[^>]*?>[\s\S]*?<\/script>/gi;
            var list = content.match(regexp);

            if (!list) {
                return [];
            }
                
            var dir = options.dir;                  //script 标签里的 src 属性相对的目录，即要解析的页面所在的目录。
            var $ = cheerio;                        //后端的 jQuery 对象。
            var lines = Lines.split(content);       //内容按行分裂的数组。
            var startNo = 0;                        //下次搜索的起始行号。



            list = list.map(function (item, index) {
                var no = Lines.getIndex(lines, item, startNo);  //行号。
                var line = lines[no];                           //整一行的 html。

                if (Lines.commented(line, item)) { //已给注释掉了。
                    return;
                }


                var props = $(item).attr();
                var href = props.src;
                var external = Url.checkFull(href);             //是否为外部地址。
                var tabs = line.indexOf(item);                  //前导空格数。
                var file = href.split('?')[0];                  //去掉 query 部分后的主体。
                var query = href.split('?')[1] || '';           //query 串。
                var meta = MetaProps.parse(props);              //解析标签里的元数据。
                var inline = meta.inline == 'true';             //是否需要内联。
                var edition = Edition.parse(file);              //返回如 { ext: '.debug.js', debug: true, min: false, } 的结构。

                if (!external) {
                    file = Path.join(dir, file);
                }

                startNo = no + 1;


                return {
                    'no': no,               //所在的行号，从 0 开始。
                    'href': href,           //原始地址。
                    'external': external,   //是否为外部 js，即使用 `http://` 完整地址引用的外部 js 资源。
                    'debug': edition.debug, //是否为 debug 版本。
                    'min': edition.min,     //是否为 min 版本。
                    'ext': edition.ext,     //后缀名，是 `.debug.js` 或 `.min.js` 或 `.js` 等。
                    'file': file,           //完整的物理路径。 
                    'query': query,         //src 中的 query 串。
                    'html': item,           //标签的 html 内容。
                    'line': line,           //整一行的 html 内容。
                    'tabs': tabs,           //前导空格数。
                    'inline': inline,       //是否需要内联。
                    'props': props,         //html 标签里的所有属性。
                    'meta': meta,           //标签里的元数据。
                    'link': null,           //file 对应的 JsLink 实例，此处先从语义上占位。
                };


            }).filter(function (item) {

                return !!item;
            });


            return list;

        },

    };
    
});


