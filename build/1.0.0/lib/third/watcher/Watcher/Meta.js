

define('Watcher/Meta', function (require, module, exports) {

    var $ = require('$');
    var $String = $.require('String');
    var Gaze = require('gaze').Gaze;   //https://github.com/shama/gaze




    return exports = {
        create: function (config, others) {
            var patterns = config.patterns || [];

            var watcher = new Gaze(patterns, {
                'debounceDelay': 0,
                'maxListeners': 9999,
            });
           
            var meta = {
                'id': $String.random(),
                'patterns': patterns,       //监控的文件路径模式。
                'watcher': watcher,         //
                'emitter': null,            //
                'this': null,
                'file$md5': {},
            };

            Object.assign(meta, others);
           
            return meta;
           
        },



    };

    

});




