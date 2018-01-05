
/**
* 对第三方库 html 的封装。
*/
define('Html', function (require, module, exports) {

    var $ = require('$');
    var Defaults = require('Defaults');
    var $Object = $.require('Object');
    var Minifier = require('html-minifier');    //https://github.com/kangax/html-minifier
    var defaults = Defaults.clone(module.id);


    

    return {
   
        /**
        * 对 html 进行压缩。
        */
        minify: function (html, options) {
            if (options === true) {
                options = null;
            }

            options = options || {};
            options = $Object.extendDeeply({}, defaults.minify, options);

            html = Minifier.minify(html, options);

            return html;

        },
    };

});




