
/**
* 
*/
define('LogicHtml/Watcher', function (require, module, exports) {

    var Watcher = require('Watcher');
    var $ = require('$');
    var $String = $.require('String');
    var $Object = $.require('Object');

    return {
        create: function (meta) {
            var watcher = new Watcher(meta.patterns);



            watcher.on(['add', 'rename'], function (files) {
                files.forEach(function (file) {
                    meta.this.addFile(file);
                });

                console.log(meta.key$files)

            });

            watcher.on('delete', function (files) {
                files.forEach(function (file) {
                    delete meta.file$html[file];

                    $Object.each(meta.key$files, function (key, files) {
                        var index = files.indexOf(file);
                        if (index < 0) {
                            return;
                        }

                        files.splice(index, 1);
                    });

                });

                console.log(meta.key$files)

            });

            watcher.on('modify', function (files) {

                files.forEach(function (file) {
                    delete meta.file$html[file];

                    $Object.each(meta.key$files, function (key, files) {
                        var index = files.indexOf(file);
                        if (index < 0) {
                            return;
                        }

                        files.splice(index, 1);
                    });

                    meta.this.addFile(file);

                });

                console.log(meta.key$files)

            });




          
            return watcher;

        },


    };

});


