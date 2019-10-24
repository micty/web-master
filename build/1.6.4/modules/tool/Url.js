
define('Tools.Url', function (require, module, exports) {

    var $ = require('$');
    var Query = $.require('Query');
    var $String = $.require('String');
    var $Object = $.require('Object');



    function getHost() {
        var os = require('os');
        var name$list = os.networkInterfaces();
        var all = [];

        for (var name in name$list) {
            var list = name$list[name];
            all = all.concat(list);
        }

        var item = all.find(function (item, index) {
            return !item.internal &&
                item.family == 'IPv4' &&
                item.address !== '127.0.0.1'
        });

        return item ? item.address : '';

    }


    function getDir(dir) {
        var path = require('path');
        var cwd = process.cwd();

        dir = path.join(cwd, dir);
        dir = dir.split('\\').join('/');
        dir = dir.split(':/')[1];

        return dir;
    }





    


    



    return exports = {

        /**
        * 生成 url。
        *   options = {
        *       sample: '',     //如 `http://{host}/{dir}index.html`。
        *       host: '',       //可选。
        *       dir: '',
        *       query: {},
        *   };
        */
        'get': function (options) {
            var sample = options.sample;
            var host = options.host;
            var dir = options.dir;
            var query = options.query;

            host = host || getHost();
            dir = dir ? getDir(dir) : '';

            var url = $String.format(sample, {
                'host': host,
                'dir': dir,
            });

            //
            if (query && !$Object.isEmpty(query)) {
                url = Query.add(url, query);
            }

            return url;

        },


        /**
        * 打开指定的 url 页面。
        *   options = {
        *       tips: '',   
        *       sample: '',
        *       host: '',
        *       dir: '',
        *       query: {},
        *   };
        */
        'open': function (options) {

            var child = require('child_process');

            var url = exports.get({
                'sample': options.sample,
                'host': options.host,
                'dir': options.dir,
                'query': options.query,
            });


            var tips = options.tips || '';

            if (tips) {
                console.log(tips.bgGreen, url.cyan);
            }

            url = url.split('&').join('^&'); //用于命令行中的 & 必须转义为 ^&
            child.exec('start ' + url);
        },
    };

});




