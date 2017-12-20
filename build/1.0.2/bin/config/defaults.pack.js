


module.exports = {

    //通过指定 packages 为 null 或去掉，可以禁用分包打包功能。
    packages: {
        patterns: [
            '**/*/package.json',
        ],
        dest: {
            dir: 'package/',
            file: 'package/package.json',
        },
    },

};