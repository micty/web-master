

module.exports = {

    dir: '../markdoc/build/htdocs/',

    //构建前要排除在外的文件或目录。
    excludes: [
        'api/',
    ],

    //构建完成后需要清理的文件或目录。
    cleans: [
        'partial/',
        'lib/',
        '**/modules/',
        '**/views/',
        '**/panels/',
        '**/*.master.html',
        '**/*.less',
        '**/*.debug.css',
        '**/*.debug.js',
        '**/index.js',
    ],

    //需要进行内容转换的文件。
    process: {
        '**/*.js': function (file, content, require) {
            return '//' + file + '\r\n' + content;
        },
    },

    masters: {
        lessLink: {
            minify: true,
            //name: 'LessLink-{name}-{md5}.css',  //如果指定则输出目标文件。
            //name: 'LessLink-{md5}.css',  //如果指定则输出目标文件。
            name: '{md5}.css',  //如果指定则输出目标文件。
            query: {},
        },

        lessBlock: {
            minify: true,
            inline: false,
            //name: 'LessBlock-{md5}.css',
            name: '{md5}.css',
            props: {},
            query: {},
        },

        jsBlock: {
            begin: 'partial/begin.js',
            end: 'partial/end.js',
            minify: true,
            inline: false,
            //name: 'JsBlock-{md5}.js',
            name: '{md5}.js',
            props: {},
            query: {},
        },
        html: {
            minify: true,
        },
    },

};