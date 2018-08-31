
/**
* 
*/
define('CssLink/Builder', function (require, module, exports) {
    var $ = require('$');
    var MD5 = require('MD5');
    var Query = $.require('Query');
    var File = require('File');
    var Css = require('Css');
    var Edition = require('Edition');



    function minify(file, done) {
        var dest = Edition.toMin(file);

        if (File.exists(dest)) {
            var content = File.read(dest);
            return done(content);
        }

        Css.minify({
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
        */
        build: function (item, done) {
            //外部资源。
            if (item.external) {
                var html = item.line;

                if (item.debug) {
                    var href = Edition.toMin(item.href);
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
            Css.minify({
                'file': file,
                'done': mix,
            });


            //内部公共方法
            function mix(content) {
                var html = '';

                if (item.inline) {
                    html = Css.inline({
                        'content': content,
                        'tabs': item.tabs,
                        'props': item.props,
                    });
                }
                else {
                    var md5 = MD5.get(content, 4);
                    var dest = Edition.toMin(item.href);

                    dest = Query.add(dest, md5);
                    html = item.line.replace(item.href, dest);
                }

                done(html);
            }

           
        },
    };
    
});


