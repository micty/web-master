


start();


function start() {
    var master = require('web-master');
    var _require = require; //原生的 require。

    /**
    * 解析命令行的参数。
    * 返回：
    *   args = {
    *       compat: false,  //是否使用了 `compat` 选项。 如果是，则使用兼容模式。
    *       pack: false,    //是否使用了 `pack` 选项。　如果是，则使用独立打包的方式。
    *       action: '',     //编译完成后要执行的动作。 如 `open` 或 `qr`。
    *       value: '',      //要传递给 action 的值。 如 `localhost`、`450`。
    *   };
    */
    var args = master.getArgs('watch');
    var defaults = require('./config/defaults.js');     //加载用于 new WebSite(defaults) 创建站点时的配置参数。
    var options = require('./config/watch.js');         //加载用于 website.watch(options) 进行监控的配置参数。


    //命令中指定了使用独立打包的方式，加载相应的配置。
    if (args.pack) {
        var pack = require('./config/defaults.pack.js');
        Object.assign(defaults.packages, pack.packages);

        pack = require('./config/watch.pack.js');
        Object.assign(options, pack);
    }




    master.on('init', function (require, module, exports) {
        var File = require('File');
        var mode = args.compat ? 'compat' : 'normal';       //compat: 兼容模式。 normal: 标准模式。
        var file = `./process/watch.${mode}.js`;            //如 `./process/watch.compat.js`。

        if (!File.exists(file)) {
            return;
        }

        var process = _require(file);
        var website = exports.website;
        var events = process(require, website, defaults);

        if (events) {
            website.on(events);
        }
    });

    master.on('done', function (require, module, exports) {
        console.log('...ooooOOOOoooo...'.bgMagenta);
    });



    master.watch({
        'args': args,
        'defaults': defaults,
        'options': options,
    });


}