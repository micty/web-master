
/**
* 对第三方库 html 的封装。
*/
define('Html', function (require, module, exports) {

    var $ = require('$');
    var $Object = $.require('Object');
    var Minifier = require('html-minifier');    //https://github.com/kangax/html-minifier

    var defaults = {
        collapseWhitespace: true,                 //折叠空白。 即删除空行、空格等，是压缩最重要的体现。
        keepClosingSlash: true,                   //保留闭合斜线。
    };
    

    return {
   
        /**
        * 对 html 进行压缩。
        */
        minify: function (html, options) {
            if (options === true) {
                options = null;
            }

            options = options || {};
            options = Object.assign({}, defaults, options);
            html = Minifier.minify(html, options);

            return html;

        },
    };

});




