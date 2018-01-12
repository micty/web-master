
/**
* 
*/
define('JsLink/Builder', function (require, module, exports) {
    var $ = require('$');
    var MD5 = require('MD5');
    var Query = $.require('Query');
    var File = require('File');
    var Js = require('Js');

    var debug = '.debug.js';
    var min = '.min.js';




    function minify(file, done) {
        var dest = file.replace(debug, min);

        if (File.exists(dest)) {
            var content = File.read(dest);
            return done(content);
        }

        Js.minify({
            'src': file,
            'done': function (content) {
                done(content);
            },
        });
    }

    

    return {




        /**
        * 构建。
        * 异步方式。
        *   item = {
        *       line: '',       //
        *       debug: false,   //
        *       min: false,     //
        *       href: '',       //
        *       file: '',       //
        *       inline: false,  //
        *       tabs: 0,        //
        *       props: {},      //
        *   };
        */
        build: function (item, done) {
            //外部资源。
            if (item.external) {
                var html = item.line;

                if (item.debug) {
                    var href = item.href.replace(debug, min);
                    html = item.line.replace(item.href, href);
                }

                return done(html);
            }



            //内部资源。

            var file = item.file;

            //内部 debug 版。
            if (item.debug) {
                minify(file, mix);
                return;
            }

            //内部 min 版。
            if (item.min) {
                var content = File.read(file);
                mix(content);
                return;
            }

            //普通版。
            Js.minify({
                'file': file,
                'done': mix,
            });


            //内部公共方法
            function mix(content) {
                var html = '';

                if (item.inline) {
                    html = Js.inline({
                        'content': content,
                        'tabs': item.tabs,
                        'props': item.props,
                    });
                }
                else {
                    var md5 = MD5.get(content, 4);
                    var dest = item.href.replace(debug, min);

                    dest = Query.add(dest, md5);
                    html = item.line.replace(item.href, dest);
                }

                done(html);
            }

           
        },
    };
    
});


