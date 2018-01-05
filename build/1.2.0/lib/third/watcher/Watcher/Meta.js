

define('Watcher/Meta', function (require, module, exports) {

    var $ = require('$');
    var $String = $.require('String');
    var Gaze = require('gaze').Gaze;   //https://github.com/shama/gaze




    return exports = {
        create: function (config, others) {
            var patterns = config.patterns || [];

            var watcher = new Gaze(patterns, {
                'debounceDelay': config.debounceDelay,
                'maxListeners': config.maxListeners,

                //轮询时间间隔。 
                //如果设置得太小而文件数过多，则 CPU 占用很高。 
                //比如设为 100 时， 2000 多个文件可高达 60%。
                'interval': config.interval,            
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




