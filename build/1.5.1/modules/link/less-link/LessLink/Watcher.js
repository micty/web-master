
/**
* 
*/
define('LessLink/Watcher', function (require, module, exports) {
    var Watcher = require('Watcher');


    return {
        create: function (meta) {

            var watcher = new Watcher(meta.file);

            watcher.on('modify', function () {
                meta.reset();
                meta.emitter.fire('change');
            });

            return watcher;

        },


    };

});


