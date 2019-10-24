
/**
* 
*/
define('Watcher/defaults', function (require, module, exports) {
    

    return {
        name: '',           //项目的名称，用于监控完成后的提示，以便在多个命令行窗口中跟其它项目进行区分。 
        debounceDelay: 500,
        maxListeners: 9999,

        /**
        * 监控的轮询时间间隔。 
        * 如果设置得太小而文件数过多，则 CPU 占用很高。 
        * 比如设为 100 时， 2000 多个文件可高达 60%。
        */
        interval: 1000,
    };

});


