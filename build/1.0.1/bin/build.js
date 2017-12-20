
/**
* 构建生产环境的代码。 使用命令:
*
* 单页应用模式:
*   node build
*   node build dist
*   node build dist open
*   node build dist open localhost
*   node build open
*   node build open localhost
*   node build qr
*   node build qr 450
*   node build dist qr
*   node build dist qr 450
*
* 独立打包模式:
*   node build pack
*   node build pack dist
*   node build pack dist open
*   node build pack dist open localhost
*   node build pack open
*   node build pack open localhost
*   node build pack qr
*   node build pack qr 450
*   node build pack dist qr
*   node build pack dist qr 450
*/




start();


function start() {
    var begin = new Date();
    var master = require('web-master');

    /**
    * 解析命令行的参数。
    *   args = {
    *       pack: false,    //是否使用了 `pack` 选项。　如果是则使用独立打包的方式。
    *       level: '',      //构建要使用的配置方案的名称。 默认为 `dist`。
    *       action: '',     //编译完成后要执行的动作。 如 `open` 或 `qr`。
    *       value: '',      //要传递给 action 的值。 如 `localhost`、`450`。
    *   };
    */
    var args = master.getArgs('build');

    //加载用于 new WebSite(defaults) 创建站点时的配置参数。
    var defaults = require('./config/defaults.js');

    //加载用于 website.build(options) 进行监控的配置参数。
    var options = require('./config/' + args.level + '.js');        //dist.js


    //加载用于独立打包时的配置参数。
    if (args.pack) {
        var pack = require('./config/defaults.pack.js');
        Object.assign(defaults, pack);

        var pack = require('./config/' + args.level + '.pack.js');  //dist.pack.js
        Object.assign(options, pack);
    }


    master.build({
        'args': args,
        'defaults': defaults,
        'options': options,

        'done': function (require, module, exports) {
            console.log('ooooOOOOoooo');

        },
    });


}







