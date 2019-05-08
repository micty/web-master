

var colors = require('colors');

function isAction(key) {
    return key == 'qr' || key == 'open';
}

function error(key) {
    console.error('无法识别的参数:'.bgRed, key.cyan);
}



module.exports = {

    /**
    * 解析命令行 `node watch` 后面的参数。
    * `node watch`
    *  0    1
    * `node watch qr`
    * `node watch qr 450`
    * `node watch open`
    * `node watch open .`
    * `node watch open localhost`
    *  0    1     2    3
    * `node watch pack`
    * `node watch pack qr`
    * `node watch pack qr 450`
    * `node watch pack open`
    * `node watch pack open .`
    * `node watch pack open localhost`
    *  0    1     2    3    4
    * `node watch compat`
    * `node watch compat qr`
    * `node watch compat qr 450`
    * `node watch compat open`
    * `node watch compat open .`
    * `node watch compat open localhost`
    *  0    1     2      3    4
    * `node watch compat pack`
    * `node watch compat pack qr`
    * `node watch compat pack qr 450`
    * `node watch compat pack open`
    * `node watch compat pack open .`
    * `node watch compat pack open localhost`
    *  0    1     2      3    4    5
    */
    watch: function (args) {

        args = args || [...process.argv];


        var meta = {
            compat: false,
            pack: false,
            action: '',
            value: '',
        };


        var key$fn = {
            'qr': function (value) {
                meta.action = 'qr';
                meta.value = value || '';
            },

            'open': function (value) {
                meta.action = 'open';
                meta.value = value || '';
            },

            'pack': function (key) {
                meta.pack = true;

                //`node watch pack`
                //`node watch compat pack`
                if (!key) {
                    return;
                }

                var rest = [...arguments].slice(1);

                if (isAction(key)) {
                    key$fn[key](...rest);
                }
                else {
                    error(key);
                }
              
            },

            'compat': function (key) {
                meta.compat = true;

                // `node watch compat`
                if (!key) {
                    return;
                }

                var rest = [...arguments].slice(1);

                if (isAction(key) || key == 'pack') {
                    key$fn[key](...rest);
                }
                else {
                    error(key);
                }
            },
        };

       

        var key = args[2];
        var rest = args.slice(3);

        switch (key) {
            case 'qr':
            case 'open':
            case 'pack':
            case 'compat':
                key$fn[key](...rest);
                break;

            default:
                if (key) {
                    error(key);
                }
                break;
        }


        return meta;
    },



    /**
    * 解析命令行 `node build` 后面的参数。
    * `node build`
    * `node build dist`
    *  0    1     2
    * `node build qr`
    * `node build qr 450`
    * `node build open`
    * `node build open .`
    * `node build open localhost`
    *  0    1     2    3
    * `node build dist qr`
    * `node build dist qr 450`
    * `node build dist open`
    * `node build dist open .`
    * `node build dist open localhost`
    *  0    1     2    3    4
    * `node build pack`
    * `node build pack qr`
    * `node build pack qr 450`
    * `node build pack open`
    * `node build pack open .`
    * `node build pack open localhost`
    *  0    1     2    3    4
    * `node build pack dist`
    * `node build pack dist qr`
    * `node build pack dist qr 450`
    * `node build pack dist open`
    * `node build pack dist open .`
    * `node build pack dist open localhost`
    *  0    1     2    3    4    5
    * `node build compat`
    * `node build compat qr`
    * `node build compat qr 450`
    * `node build compat open`
    * `node build compat open .`
    * `node build compat open localhost`
    *  0    1     2      3    4
    * `node build compat dist`
    * `node build compat dist qr`
    * `node build compat dist qr 450`
    * `node build compat dist open`
    * `node build compat dist open .`
    * `node build compat dist open localhost`
    *  0    1     2      3    4    5
    * `node build compat pack`
    * `node build compat pack qr`
    * `node build compat pack qr 450`
    * `node build compat pack open`
    * `node build compat pack open .`
    * `node build compat pack open localhost`
    *  0    1     2      3    4    5
    * `node build compat pack dist`
    * `node build compat pack dist qr`
    * `node build compat pack dist qr 450`
    * `node build compat pack dist open`
    * `node build compat pack dist open .`
    * `node build compat pack dist open localhost`
    *  0    1     2      3    4    5    6
    */
    build: function (args) {
        args = args || [...process.argv];

        var meta = {
            compat: false,
            pack: false,
            scheme: 'dist',
            action: '',
            value: '',
        };
        
        var key$fn = {
            'qr': function (value) {
                meta.action = 'qr';
                meta.value = value || '';
            },

            'open': function (value) {
                meta.action = 'open';
                meta.value = value || '';
            },


            'scheme': function (scheme, action, value) {
                meta.scheme = scheme;

                if (action) {
                    key$fn[action](value);
                }
            },

            'pack': function (key) {
                meta.pack = true;

                //`node build pack`
                //`node build compat pack`
                if (!key) {
                    return;
                }

                var rest = [...arguments].slice(1);

                if (key == 'qr' || key == 'open') {
                    key$fn[key](...rest);
                }
                else {
                    key$fn['scheme'](key, ...rest);
                }
            },

            'compat': function (key) {
                meta.compat = true;

                // `node build compat`
                if (!key) {
                    return;
                }

                var rest = [...arguments].slice(1);

                if (key == 'qr' || key == 'open' || key == 'pack') {
                    key$fn[key](...rest);
                }
                else {
                    key$fn['scheme'](key, ...rest);
                }
            },

        };



        var key = args[2];
        var rest = args.slice(3);

        switch (key) {
            case 'qr':
            case 'open':
            case 'pack':
            case 'compat':
                key$fn[key](...rest);
                break;

            default:
                if (key) {
                    key$fn['scheme'](key, ...rest);
                }

                break;
        }


        return meta;
    },

};