
/**
* Css 文件工具类。
*/
define('Css', function (require, module, exports) {
    var $ = require('$');
    var $String = $.require('String');
    var $Object = $.require('Object');
    var Query = $.require('Query');
    var File = require('File');
    var less = require('less');
    var Lines = require('Lines');
    var Props = module.require('Props');

    var defaults = module.require('defaults');


    return {
        /**
        * 设置默认配置项。
        *   options = {
        *       sample: '', //要渲染生成 `<script>` 所使用的 html 模板。
        *   };
        */
        config: function (options) {
            Object.assign(defaults, options);
        },

        /**
        * 压缩 css 文件。
        *   options = {
                content: '',//输入的源文件内容。
                src: '',    //输入的源文件路径。 如果指定，则 content = File.read(src);
                dest: '',   //输出的目标文件路径。 如果指定，则写入目标文件。
                file: '',   //输入的源文件和输出的目标文件路径，如果指定，则 src = dest = file;
                done: fn,   //执行完后的回调函数。
            };
        */
        minify: function (options) {
            var content = options.content;
            var src = options.src;
            var dest = options.dest;
            var file = options.file;
            var done = options.done;

            if (file) {
                src = dest = file;
            }

            if (src) {
                content = File.read(src);
            }

            //https://github.com/mishoo/UglifyJS2/tree/harmony
            var UglifyJS = require('uglify-es');
            var code = '';
            var result = null;


            if (src) {
                console.log('压缩'.bgRed, src);
            }

            less.render(content, { 'compress': true, }, function (error, output) {
                if (error) {
                    console.log('css 压缩错误:'.bgRed, error.message.bgRed);
                    src && console.log('所在文件: '.bgMagenta, src.bgMagenta);
                    console.log(error);
                    throw error;
                }


                var css = output.css;

                dest && File.write(dest, css);
                done && done(css);
            });
        },
        
        /**
        * 混入。
        * 生成 `<link rel="stylesheet" href="xx.css" />` 标签的 html。
        *   options = {
                tabs: 0,    //缩进的空格数。
                href: '',   //link 标签中的 href 属性。
                query: {},  //href 属性中的 query 部分。
                props: {},  //其它属性。
            };
        */
        mix: function (options) {
            options = options || {};

            var href = options.href || '';
            var query = options.query;
            var props = Props.stringify(options.props);

            if (query && !$Object.isEmpty(query)) { //忽略空白对象 {}。
                href = Query.add(href, query);
            }


            var html = $String.format(defaults.sample, {
                'href': href,
                'props': props,
            });

            html = Lines.stringify(html, options.tabs);

            return html;
        },


        /**
        * 内联。
        * 把 css (或文件的)内容生成内联的 `<style> ... </style>`方式。
        *   options = {
                content: '',    //css 内容。 如果不指定，则从 file 中读取。
                file: '',       //输入的源 css 文件路径。
                tabs: 0,        //缩进的空格数。
                props: {},      //其它属性。
                comment: '',    //是否添加注释。 如果指定为 true，则简单以 file 路径作为注释。
            };
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
                '<style' + props + '>',
                    content,
                '</style>',
            ];

            content = Lines.stringify(content, options.tabs);

            return content;
        },
    };



   



});




