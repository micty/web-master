
/**
* 
*/
define('MasterBlock/Watcher', function (require, module, exports) {
    var Watcher = require('Watcher');


    return {
        create: function (meta) {

            var watcher = new Watcher(meta.patterns);

            watcher.on(['add', 'delete', 'rename', ], function (files, name) {

                meta.this.reset();
                meta.this.parse();
                meta.this.watch();
                meta.change(100);
            });

          
            return watcher;

        },


    };

});


