
/**
* 
*/
define('WebSite/Meta', function (require, module, exports) {

    var $ = require('$');
    var $String = $.require('String');


    return {

        create: function (config, others) {

            var meta = {
                'id': $String.random(),
                'this': null,
                'emitter': null,

                'masters': config.masters,              //母版页文件路径模式列表。
                'packages': config.packages,            //
                'cssDir': config.cssDir,                //
                'htdocsDir': config.htdocsDir,          //
                'buildDir': config.buildDir,            //
                'packageDir': config.packageDir,        //
                'packageFile': config.packageFile,      //
                'url': config.url,                      //
                'qr': config.qr,                        //
                'cwd': config.htdocsDir,                //当前工作目录，是 htdocsDir 或 buildDir。
            };


            Object.assign(meta, others);

           

            return meta;
           
        },


    };
    
});


