
/**
* 获取块中的路径模式列表。
*/
define('BlockList/Patterns', function (require, module, exports) {
    var $ = require('$');
    var $String = $.require('String');
    var Lines = require('Lines');
    
    //包装多一层匿名立即执行函数
    var sample = [
        'return (function () { ',
        '   var a = {patterns};',
        '   return a;',
        '})();',

    ].join('\r\n');


    return {

        /**
        * 提取里面的模式。
        */
        get: function (lines) {
            var patterns = lines.slice(2, -2);

            if (!patterns.length) {
                return [];
            }

            patterns = Lines.join(patterns);


            //执行母版页的 js 代码，并注入变量。
            try {
                var code = $String.format(sample, { patterns, });
                var fn = new Function('require', code);
                patterns = fn(require);
            }
            catch (ex) {
                console.log(ex);
                patterns = [];
            }
     

            if (!Array.isArray(patterns)) {
                console.log('返回模式必须是一个数组。'.red);
                console.log(lines);
                patterns = [];
            }

            return patterns;
        },
    };

});




