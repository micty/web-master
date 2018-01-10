
/**
* 文件引用管理类。
*/
define('FileRefs', function (require, module, exports) {


    var file$count = {}; //文件计数器。


    return {

        /**
        * 添加一个文件引用到计数中。
        */
        add: function (file) {
            if (!file) {
                return;
            }

            var count = file$count[file] || 0;

            count = count + 1;
            file$count[file] = count;

            return count;
        },

        /**
        * 从计数中删除一个文件引用。
        * 可以指定是否强制立即删除对应的物理文件。
        */
        delete: function (file, force) {

            if (!file || !file$count[file]) {
                return;
            }


            //强制立即删除。
            if (force) {
                var File = require('File');
                file$count[file] = 0;
                File.delete(file);
                return;
            }



            var count = file$count[file];
            count = count - 1;
            file$count[file] = count;

            return count;
        },

        /**
        * 清理掉引用计数为 0 的对应的物理文件。
        */
        clean: function () {

            var File = require('File');

            var files = Object.keys(file$count).filter(function (file) {
                return file$count[file] == 0;
            });

            File.delete(files);
        },


    };

});
