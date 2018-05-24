
/**
* 
*/
define('HtmlLink/Parser', function (require, module, exports) {
    var $ = require('$');
    var Path = require('Path');
    var Lines = require('Lines');
    var File = require('File');
    var cheerio = require('cheerio');


    function parse(content, options) {
        //提取出如引用了 html 分文件的 link 标签
        var list = content.match(options.regexp);
        var lines = Lines.split(content);


        if (!list) {
            return { 'lines': lines, 'list': [], };
        }


        var startNo = 0;    //下次搜索的起始行号


        list = list.map(function (item, index) {
            var no = Lines.getIndex(lines, item, startNo);  //行号。
            var line = lines[no];                           //整一行的 html。

            if (Lines.commented(line, item)) { //已给注释掉了。
                return null;
            }


            var $ = cheerio;
            var props = $(item).attr();
            var href = props.href;
            var file = Path.join(options.dir, href);

            startNo = no + 1;

            var tabs = line.indexOf(item);              //前导空格数。

            return {
                'no': no,           //所在的行号，从 0 开始。
                'href': href,       //原始地址。
                'file': file,       //完整的物理路径。 
                'html': item,       //标签的 html 内容。
                'line': line,       //整一行的 html 内容。
                'tabs': tabs,       //前导空格数。
                'props': props,     //完整的 html 属性集合。
                'link': null,       //file 对应的 HtmlLink 实例，此处先从语义上占位。
            };


        }).filter(function (item) { //要过滤一下。
            return !!item;
        });


        return { 'lines': lines, 'list': list, };
    }




    return {

        /**
        * 解析。
        *   options = {
        *       file: '',       //必选。 html 片段文件路径。
        *       content: '',    //可选。 html 片段文件内容，如果与 file 字段同时指定，则优先取本字段。
        *   };
        */
        parse: function (options) {
            //options 中可以同时指定 content 和 file，优先取 content。
            var file = options.file;
            var dir = Path.dir(file);
            var content = options.content || File.read(file);
            var $ = cheerio.load(content);
            var regexp = /<link\s+.*rel\s*=\s*["\']html["\'].*\/>/ig;



            //提取出如引用了 html 分文件的 link 标签
            var info = parse(content, {
                'regexp': regexp,
                'dir': dir,
            });

            
            return {
                '$': $,
                'content': content,
                'lines': info.lines,
                'list': info.list,
                'dir': dir,
            };

        },
    };
    
});


