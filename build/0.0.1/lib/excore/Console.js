


define('Console', function (require, module, exports) {

    var File = require('File');
    var Defaults = require('Defaults');
    var $ = require('$');

    var log = console.log.bind(console);
    var defaults = Defaults.get(module.id);
    var file = defaults.file;
    var tag = String.fromCharCode(27); //console �����ɫ�����µĿ����ַ���

    File.delete(file);

    var now = '';
    var RN = '\r\n';


    return {
        /**
        * ��������ļ���־�Ŀ���̨ log ������
        */
        log: function () {
            log(...arguments);

            var s = [...arguments].join(' ');

            //�滻�����п��ܵĿ����ַ���
            for (var i = 10; i <= 100; i++) {
                var old = tag + '[' + i + 'm';

                s = s.split(old).join('');
            }

            //һ�ξ���һ�С�
            s = s + RN;


            //ָ����Ҫ���ʱ�����
            if (defaults.timestamp) {
                var dt = $.Date.format(new Date(), 'yyyy-MM-dd HH:mm:ss');

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



