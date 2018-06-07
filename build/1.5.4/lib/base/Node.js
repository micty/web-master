


//node.js 的原生模块


var load = require; //node.js原生的 require() 方法。
require('colors');  //这个要先加载，因为其它模块用的是 string 的原型上的颜色值。




//把原生模块重定义映射到 define() 模块中。
[
    'crypto',
    'fs',
    'path',
    'os',
    'child_process',    //打开页面用到。

    //第三方库
    'cheerio',          //后端的精简版核心 jQuery。 https://github.com/cheeriojs/cheerio
    'colors',           //控制台字体颜色。 https://github.com/Marak/colors.js
    'gaze',             //文件监控器。 https://github.com/shama/gaze
    'html-minifier',    //html 压缩器。
    'iconv-lite',       //文件流复制等。 https://www.npmjs.com/package/iconv-lite
    'less',             //less 编译器。
    'minimatch',        //文件模式匹配。
    'uglify-es',        //js 压缩器，针对 es6 的版本。
    'defineJS',         //树形结构的 CMD 模块定义与管理器。

].map(function (name) {

    define(name, function (require, module, exports) {

        var M = load(name);
        return M;
    });

});


//text colors

    //black
    //red
    //green
    //yellow
    //blue
    //magenta
    //cyan
    //white
    //gray
    //grey

//background colors

    //bgBlack
    //bgRed
    //bgGreen
    //bgYellow
    //bgBlue
    //bgMagenta
    //bgCyan
    //bgWhite

