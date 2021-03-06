


define('Console', function (require, module, exports) {

    var File = require('File');
    var Defaults = require('Defaults');
    var $ = require('$');
    var $Date = $.require('Date');

    var log = console.log.bind(console);
    var defaults = Defaults.get(module.id);
    var file = defaults.file;
    var tag = String.fromCharCode(27); //console 字体彩色化导致的控制字符。

    File.delete(file);

    var now = '';
    var RN = '\r\n';


    return {
        /**
        * 带输出到文件日志的控制台 log 方法。
        */
        log: function () {
            log(...arguments);

            var s = [...arguments].join(' ');

            //替换掉所有可能的控制字符。
            for (var i = 10; i <= 100; i++) {
                var old = tag + '[' + i + 'm';

                s = s.split(old).join('');
            }

            //一次就是一行。
            s = s + RN;


            //指定了要添加时间戳。
            if (defaults.timestamp) {
                var dt = $Date.format(new Date(), 'yyyy-MM-dd HH:mm:ss');

                if (dt != now) {
                    now = dt;
                    s = RN + dt + RN + s;
                }
            }
          


            File.append(file, s, null);

        },
    };
});


''



