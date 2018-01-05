
/**
* 
*/
define('Package/Parser', function (require, module, exports) {

    var Path = require('Path');
    var File = require('File');
    var Log = require('Log');
    var Name = module.require('Name');


    return exports = {
        /**
        * 解析。
        */
        parse: function (file) {
            var json = File.readJSON(file);

            if (!json) {
                console.log('文件'.red, file, '不是一个有效的包文件'.red);
                throw new Error();
            }


            var dir = Path.dir(file);   //分包 package.json 文件所在的目录。
            var name = Name.get({ 'name': json.name, 'dir': dir, });

            if (!name) {
                console.log('包文件'.bgRed, file.yellow, '中未指定 name 字段，且未在其的所在目录找到任何 js 文件。'.bgRed);
                throw new Error();
            }


            var less = json.css || []; //这里由于历史应用的问题，先取 `css` 字段。
            var js = json.js || [];
            var html = json.html || [];

            //确保对外是个数组。
            less = Array.isArray(less) ? less : [less];
            js = Array.isArray(js) ? js : [js];
            html = Array.isArray(html) ? html : [html];

            return {
                'name': name,
                'dir': dir,
                'file': file,   //外部可能会用到。
                'patterns': {
                    'less': less,   
                    'js': js,
                    'html': html,
                },
            };
        },

        /**
        * 比较实质内容是否有发生变化。
        */
        compare: function (file, old) {
            var info = exports.parse(file);

            var changed =
                info.name != old.name ||
                info.patterns.less.join() != old.patterns.less.join() ||
                info.patterns.js.join() != old.patterns.js.join() ||
                info.patterns.html.join() != old.patterns.html.join();

            return changed ? info : null;

        },

    };
    
});


