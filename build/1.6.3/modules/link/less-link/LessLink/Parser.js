
/**
* 
*/
define('LessLink/Parser', function (require, module, exports) {
    var $ = require('$');
    var Path = require('Path');
    var Lines = require('Lines');
    var cheerio = require('cheerio');

    var Dest = module.require('Dest');



    return {

        'get': Dest.get,


        /**
        * 从指定的 html 内容中解析出 `<link rel="less" />` 的标签列表信息。
        *   options = {
        *       dir: '',    //link 标签里的 href 属性相对的目录，即要解析的页面所在的目录。
        *       htdocs: '', //整个站点的根目录，如果不指定，则默认为是页面所在的目录。
        *       css: '',    //样式目录，相对于 htdocs，如 `style/css/`。
        *   };
        */
        parse: function (content, options) {
            //提取出如引用了 less 文件的 link 标签
            var regexp = /<link\s+.*rel\s*=\s*["\']less["\'].*\/>/ig;
            var list = content.match(regexp);

            if (!list) {
                return [];
            }
                
            var dir = options.dir;                  //less 标签里的 href 属性相对的目录，即要解析的页面所在的目录。
            var htdocs = options.htdocs || dir;     //整个站点的根目录，如果不指定，则默认为是页面所在的目录。
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
                var href = props.href;
                var file = Path.join(dir, href);                
               
                var tabs = line.indexOf(item);                  //前导空格数。
                var inline = props.inline == 'true';            //是否需要内联。

                var dest = Dest.get({
                    'htdocs': htdocs,
                    'dir': dir,
                    'css': options.css,
                    'file': file,
                });


                startNo = no + 1;


                return {
                    'no': no,           //所在的行号，从 0 开始。
                    'href': href,       //原始地址。
                    'file': file,       //less 完整的物理路径。 
                    'html': item,       //标签的 html 内容。
                    'line': line,       //整一行的 html 内容。
                    'tabs': tabs,       //前导空格数。
                    'inline': inline,   //是否需要内联。
                    'props': props,     //html 标签里的所有属性。
                    'link': null,       //file 对应的 LessLink 实例，此处先从语义上占位。
                    'dest': dest,       //输出的目标信息，是一个 {}。
                };


            }).filter(function (item) {

                return !!item;
            });


            return list;

        },

    };
    
});


