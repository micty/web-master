

define('Console', function (require, module, exports) {
    var File = require('File');
    var $ = require('$');
    var $Date = $.require('Date');
    var $String = $.require('String');


    var log = console.log.bind(console);
    var error = console.error.bind(console);

    var tag = String.fromCharCode(27); //console 字体彩色化导致的控制字符。
    //var tag = '\\u001b';

    var now = '';
    var RN = '\r\n';


    var defaults = {
        file: 'console.log',
        timestamp: true,
    };



    var buffers = [];
    var tid = null;


    function write(content) {
        clearTimeout(tid);
        buffers.push(content);

        tid = setTimeout(function () {
            var content = buffers.join('');

            buffers = [];
            File.append(defaults.file, content, null);

        }, 500);

    }


    function done() {

        var file = defaults.file;

        if (!file) {
            return;
        }


        var args = [...arguments].map(function (item) {
            if (typeof item == 'string') {
                return item;
            }

            try {
                var json = JSON.stringify(item, null, 4);

                return json;
            }
            catch (ex) {
                return item;
            }
        });


        var s = args.join(' ');

        //�滻�����п��ܵĿ����ַ���
        for (var i = 10; i <= 100; i++) {
            var old = tag + '[' + i + 'm';

            s = s.split(old).join('');
        }

        //һ�ξ���һ�С�
        s = s + RN;


        //ָ����Ҫ���ʱ�����
        var timestamp = defaults.timestamp;

        if (timestamp) {
            var dt = $Date.format(new Date(), timestamp);

            if (dt != now) {
                now = dt;
                s = RN + dt + RN + s;
            }
        }


        write(s);
    }





    return {
        /**
        * ����Ĭ��ѡ�
        */
        config: function (options) {
            options = options || {};
            File.delete(defaults.file);


            var file = options.file;
            var timestamp = options.timestamp;

            if (timestamp === true) {
                timestamp = 'yyyy-MM-dd HH:mm:ss';
            }

            if (file) {
                var dt = $Date.format(new Date, 'yyyy MM dd HH mm ss');
                dt = dt.split(' ');

                file = $String.format(file, {
                    'yyyy': dt[0],
                    'MM': dt[1],
                    'dd': dt[2],
                    'HH': dt[3],
                    'mm': dt[4],
                    'ss': dt[5],
                });
            }

            defaults = {
                'file': file,
                'timestamp': timestamp,
            };
        },


        /**
        * ��������ļ���־�Ŀ���̨ log ������
        */
        log: function () {
            log(...arguments);
            done(...arguments);
        },

        /**
        * ��������ļ���־�Ŀ���̨ error ������
        * �Ұѿ���̨�����ݱ���ɫ��Ϊ��ɫ��
        */
        error: function () {

            var args = [...arguments].map(function (item) {
                if (typeof item == 'string') {
                    return item.bgRed;
                }

                try {
                    var json = JSON.stringify(item, null, 4);

                    return json.bgRed;
                }
                catch (ex) {
                    return item;
                }
            });

            error(...args);
            done(...args);
        },

    };
});



