

module.exports = {

    /**
    * 解析命令行 `node watch` 后面的参数。
    */
    watch: function (args) {

        args = args || [...process.argv];

        var mode = args[2];
        var action = args[3];
        var value = args[4];

        //单页应用模式。
        if (mode != 'pack') {
            action = args[2];
            value = args[3];
        }

        return {
            'pack': mode == 'pack', //是否使用独立打包的方式。
            'action': action || '', //编译完成的操作，如 `open` 或 `qr`。
            'value': value || '',   //要额外传递给 action 的值。
        };
    },



    /**
    * 解析命令行 `node build` 后面的参数。
    */
    build: function (args) {

        args = args || [...process.argv];


        //完整情况: 
        //node build pack dist open localhost
        //0    1     2    3    4    5

        var index = 2;
        var mode = args[index++];

        if (mode != 'pack') {
            index--;
        }

        var level = args[index++];
        if (level == 'open' || level == 'qr') {
            index--;
            level = '';     //这里要置空
        }

        var action = args[index++];
        var value = args[index++];

        return {
            'pack': mode == 'pack',     //是否使用独立打包的方式。
            'level': level || 'dist',   //配置的方案名称，默认为 `dist`。
            'action': action || '',     //编译完成的操作，如 `open` 或 `qr`。
            'value': value || '',       //要额外传递给 action 的值。
        };
    },

};