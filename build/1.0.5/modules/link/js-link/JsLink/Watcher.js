
/**
* 
*/
define('JsLink/Watcher', function (require, module, exports) {

    var Watcher = require('Watcher');


    return {
        create: function (meta) {

            var watcher = new Watcher(meta.file);

            watcher.on('modify', function () {

                meta.emitter.fire('change');

            });

            return watcher;

        },


    };

});


