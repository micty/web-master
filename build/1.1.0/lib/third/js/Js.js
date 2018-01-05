
/**
* Js 文件工具类。
*/
define('Js', function (require, module, exports) {

    var $ = require('$');
    var $String = $.require('String');
    var $Object = $.require('Object');
    var Query = $.require('Query');
    var Lines = require('Lines');
    var File = require('File');
    var MD5 = require('MD5');
    var UglifyJS = require('uglify-es'); //https://github.com/mishoo/UglifyJS2/tree/harmony
    var Props = module.require('Props');


    return exports = {
        /**
        * 合并 js 文件列表。
        *   list = [file, { file } ];
        *
        *   options = {
        *       begin: '',      //可选，闭包头文件。
        *       end: '',        //可选，闭包的尾文件。
        *       dest: '',       //可选，要写入的目标文件。
        *   };
        */
        concat: function (list, options) {
            list = list || [];
            options = options || {};

            if (!list || !list.length) {
                return {
                    'content': '',
                    'files': [],
                    'dest': '',
                    'md5': 'D41D8CD98F00B204E9800998ECF8427E', //空字符串的。
                };
            }

            var dest = options.dest;
            var begin = options.begin;
            var end = options.end;
            var contents = [];
            var files = [];


            list = [begin, ...list, end, ];

            list.forEach(function (item) {
                if (!item) {
                    return;
                }
               
                var file = typeof item == 'object' ? item.file : item;
                var content = File.read(file);

                contents.push(content);
                files.push(file);
            });

            console.log('合并'.bgGreen, files.length.toString().cyan, '个文件:');
            console.log('    ' + files.join('\r\n    ').gray);

            contents = Lines.join(contents);
            
            var md5 = MD5.get(contents);

            //写入合并后的 js 文件。
            if (dest) {
                dest = $String.format(dest, { 'md5': md5, });
                File.write(dest);       
            }

            return {
                'content': contents,
                'files': files,
                'dest': dest,
                'md5': md5,
            };

        },

        
        /**
        * 压缩 js 文件。
        *   options = {
        *       content: '',//输入的源文件内容。
        *       src: '',    //输入的源文件路径。 如果指定，则 content = File.read(src);
        *       dest: '',   //输出的目标文件路径。 如果指定，则写入目标文件。
        *       file: '',   //输入的源文件和输出的目标文件路径，如果指定，则 src = dest = file;
        *       done: fn,   //执行完后的回调函数。
        *   };
        */
        minify: function (options) {
            var content = options.content;
            var src = options.src || '';
            var dest = options.dest;
            var file = options.file;
            var done = options.done;

            if (file) {
                src = dest = file;
            }

            if (src) {
                content = File.read(src);
            }

            var size = $String.getByteLength(content);
            size = size / 1024;
            size = Math.ceil(size).toString();
            console.log('开始压缩 js 内容', size.cyan, 'KB'.gray, '...');


            //直接从内容压缩，不读取文件
            var info = UglifyJS.minify(content);  //针对 es6。
            var code = info.code;
            var error = info.error;

            if (error) {
                var lines = Lines.split(content);
                var no = error.line;
                var prefix = lines[no - 2] || '';
                var line = lines[no - 1];       //这一行是发生错误的行。 因为 error.line 是从 1 开始的。
                var suffix = lines[no] || '';

                console.log('js 压缩错误:'.bgRed, src.red );
                console.log(JSON.stringify(error, null, 4).bgRed);  //标红。

                console.log('压缩前的内容出错的上下文:');
                console.log(((no - 1) + ':').cyan, prefix.bgMagenta);
                console.log(((no - 0) + ':').cyan, line.bgRed);
                console.log(((no + 1) + ':').cyan, suffix.bgMagenta);
                console.log('');

                File.write('all.error.debug.js', content);
                console.log('已把压缩前的内容写入到  all.error.debug.js，请根据错误提示进行检查。'.bgRed);

                console.log(error);                                 //这个可以把堆栈信息打印出来。
                throw error;
            }

            var size2 = $String.getByteLength(code);
            size2 = size2 / 1024;
            size2 = Math.ceil(size2).toString();

            var percent = (size - size2) / size * 100;
            percent = percent.toFixed(2).toString();
            console.log('成功压缩 js 内容', size2.cyan, 'KB'.gray, '压缩率', percent.cyan + '%'.gray);



            dest && File.write(dest, code); //写入压缩后的 js 文件。
            done && done(code);

            return code;
        },

        

        /**
        * 内联。
        * 把 js (或文件的)内容生成内联的 `<script> ... </script>`方式。
        *   options = {
        *       content: '',    //js 内容。 如果不指定，则从 file 中读取。
        *       file: '',       //输入的源 css 文件路径。
        *       tabs: 0,        //缩进的空格数。
        *       props: {},      //其它属性。
        *       comment: '',    //是否添加注释。 如果指定为 true，则简单以 file 路径作为注释。
        *   };
        */
        inline: function (options) {
            var file = options.file;
            var comment = options.comment;
            var content = options.content || File.read(file);
            var props = Props.stringify(options.props);

            if (comment === true) {
                comment = file || '';
            }

            if (comment) {
                comment = '/**' + comment + '*/';
            }

            content = comment ? [comment, content] : [content];
            content = Lines.stringify(content, 4);  //content 的内容先缩进一级。

            content = [
                '<script' + props + '>',
                    content,
                '</script>',
            ];

            content = Lines.stringify(content, options.tabs);

            return content;
        },

        /**
        * 混入。
        * 生成 `<script src="xx"></script>` 标签的 html。
        *   options = {
        *       href: '',   //script 标签中的 src 属性。
        *       tabs: 0,    //缩进的空格数。
        *       props: {},  //其它属性。
        *       query: {},  //生成到 script 标签 src 属性里的 query 部分。 
        *   };
        */
        mix: function (options) {
            options = options || {};

            var href = options.href;
            var query = options.query;
            var props = Props.stringify(options.props);

            if (query && !$Object.isEmpty(query)) { //忽略空白对象 {}。
                href = Query.add(href, query);
            }

            var html = $String.format('<script src="{href}"{props}></script>', {
                'href': href,
                'props': props,
            });

            html = Lines.stringify(html, options.tabs);

            return html;
        },

        /**
        * 构建。
        *   options = {
        *       list: [],
        *       begin: '',
        *       end: '',
        *       tabs: 0,        //缩进的空格数。
        *       minify: false,  //是否压缩。
        *       inline: false,  //是否内容。
        *       dest: '',       //
        *       href: '',
        *       props: {},
        *       query: {},      //生成到 script 标签 src 属性里的 query 部分。 
        *   };
        */
        build: function (options) {
            var list = options.list;
            var dest = options.dest;
            var tabs = options.tabs;
            var props = options.props;

            //先合并。
            var concat = exports.concat(list, {
                'begin': options.begin,
                'end': options.end,
            });

            var content = concat.content;
            var md5 = concat.md5;

            //再压缩。
            if (options.minify) {
                content = exports.minify({ 'content': content, });
                md5 = MD5.get(content);
            }

            var html = '';

            if (options.inline) {
                html = exports.inline({
                    'content': content,
                    'tabs': tabs,
                    'props': props,
                });
            }
            else {
                var href = $String.format(options.href, { 'md5': md5, });

                html = exports.mix({
                    'href': href,
                    'tabs': tabs,
                    'props': props,
                    'query': options.query,
                });
            }

            if (dest) {
                dest = $String.format(dest, { 'md5': md5, });
                File.write(dest, content);
            }

            return html;

        },
    };



   



});




