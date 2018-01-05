
/**
* 
*/
define('MasterPage/HtmlLinks', function (require, module, exports) {

    var $ = require('$');
    var $String = $.require('String');
    var Tasks = $.require('Tasks');

    var Path = require('Path');
    var Lines = require('Lines');
    var File = require('File');
    var cheerio = require('cheerio');


    var HtmlLink = require('HtmlLink');



    return exports = {

        /**
        * 
        */
        parse: function (meta) {
            //下级静态引用对应的 HtmlLink 实例。
            var list = [];

            //当前母版页对应的 HtmlLink 实例，因为母版页也是一个 html 片段页。
            var link = meta.link || new HtmlLink({
                'file': meta.file,
                'content': meta.content,
            });

            link.reset();
            link.parse();

            link.each(function (item) {
                list.push(item);
            });

            meta.link = link;

            return list;

        },

        /**
        * 
        */
        render: function (meta, done) {
            meta.HtmlLinks.forEach(function (item) {
                var html = item.link.render({
                    'tabs': item.tabs,
                });

                meta.lines[item.no] = html;
            });

            done();
        },

        /**
        *
        */
        watch: function (meta) {

            meta.HtmlLinks.forEach(function (item) {

                item.link.on('change', function () {
                    var html = this.render({
                        'tabs': item.tabs,
                    });

                    meta.lines[item.no] = html;
                    meta.mix(500);

                });

                item.link.watch();

            });
        },


    };
    
});


