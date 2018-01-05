


module.exports = {

    htdocs: '../htdocs/',
    css: 'style/css/',

    url: 'http://{host}/{dir}index.html',

    qr: {
        width: 380,
        url: 'http://qr.topscan.com/api.php',
    },

    console: {
        file: 'console.log',    //如果指定则输出日出文件。
        timestamp: true,        //是否自动加上时间戳。
    },

    watcher: {
        debounceDelay: 500,
        maxListeners: 9999,

        /**
        * 监控的轮询时间间隔。 
        * 如果设置得太小而文件数过多，则 CPU 占用很高。 
        * 比如设为 100 时， 2000 多个文件可高达 60%。
        */
        interval: 600,
    },


    //通过指定 masters 为 null 或去掉，可以禁用母版页功能。
    masters: {
        patterns: ['**/*.master.html'],
        dest: '{name}.html',
    },

};