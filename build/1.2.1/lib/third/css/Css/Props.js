
/**
* 标签里的自定义属性。
*/
define('Css/Props', function (require, module, exports) {

    //需要忽略掉的属性。
    var ignores = ['href', 'rel', 'inline'];



    return {
        /**
        * 
        */
        stringify: function (props) {
            if (!props) {
                return '';
            }


            var list = [];

            Object.keys(props).forEach(function (key) {
                if (ignores.includes(key)) {
                    return;
                }


                var value = props[key];
                var item = key + '="' + value + '"';

                list.push(item);
            });

            if (!list.length) {
                return '';
            }


            props = list.join(' ');
            props = ' ' + props;

            return props;

        },

    };
    
});


