
/**
* 
*/
define('WebSite/Meta', function (require, module, exports) {

    var $ = require('$');
    var $String = $.require('String');
    var Path = require('Path');



    return {
        /**
        * 
        */
        create: function (config, others) {

            var htdocs = config.htdocs;

            var meta = {
                'id': $String.random(),             //实例 id。
                'this': null,                       //方便内部引用自身的实例。
                'emitter': null,                    //事件驱动器。

                'url': config.url,                  //通过 open 命令要打开的网站的地址。 如 `http://{host}/{dir}index.html`。
                'qr': config.qr,                    //打开二维码的配置信息，是一个 {}。


                'htdocs': htdocs,                   //网站的根目录。 如 `../htdocs/`
                'cwd': htdocs,                      //当前工作目录，是 htdocs 或 build。
                'css': config.css,                  //网站的样式目录。 如 `style/css/`，相对于网站的根目录。

                'masters': config.masters,          //针对 MasterBlock 的配置。
                'packages': config.packages,        //针对 PackageBlock 的配置。

                'MasterBlock': null,                //MasterBlock 实例。
                'PackageBlock': null,               //PackageBlock 实例。

            };


            Object.assign(meta, others);
           

            return meta;
           
        },


    };
    
});


