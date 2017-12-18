


module.exports = {

    htdocs: '../markdoc/htdocs/',
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

    //通过指定 masters 为 null 或去掉，可以禁用母版页功能。
    masters: {
        patterns: ['**/*.master.html'],
        dest: '{name}.html',
    },

};