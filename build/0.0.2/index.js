
var path = require('path');
var $ = require('./f/defineJS');
var Args = require('./args');
var _require = require;




module.exports = {
    launch: function (factory) {
        $.config({
            base: __dirname,
            modules: [
                'lib/',
                'modules/',
                'defaults/',
            ],
        });

        $.launch(function (require, module) {
            var Console = require('Console');
            console.log = Console.log;


            var Emitter = $.require('Emitter');
            var WebSite = require('WebSite');
            var Defaults = require('Defaults');
            var File = require('File');

            var website = new WebSite();
            var emitter = new Emitter();


            var exports = {

                getArgs: function (type) {
                    var value = Args[type]();
                    return value;
                },

                config: function (files) {
                    if (!Array.isArray(files)) {
                        files = [files];
                    }


                    files.forEach(function (file) {
                        if (!file) {
                            return;
                        }

                        var defaults = file;

                        if (typeof file == 'string') {
                            file = path.resolve(file);
                            file = file.replace(/\\/g, '/');

                            var ext = path.extname(file).toLowerCase();

                            if (ext == '.json') {
                                defaults = File.readJSON(file);
                            }
                            else { // js
                                defaults = _require(file);
                            }
                        }

                        Defaults.set(defaults);
                    });

                },

                /**
                * 
                */
                watch: function (action, args) {
                    website.watch(function () {
                        emitter.fire('watch', action, args);
                    });
                },

                /**
                * 
                */
                build: function (options, action, args) {
                    website.build(options, function () {
                        emitter.fire('build', action, args);
                    });
                },

                /**
                * 
                */
                open: website.open.bind(website),

                /**
                * 
                */
                openQR: website.openQR.bind(website),

                /**
                * 
                */
                on: emitter.on.bind(emitter),

            };


            factory && factory(require, module, exports);


        });
    },

};



