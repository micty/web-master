

/**
* 目录工具。
*/
define('Directory', function (require, module, exports) {

    var fs = require('fs');
    var path = require('path');

    //标准化。
    function normalize(dir) {
        dir = dir.replace(/\\/g, '/');    //把 `\` 换成 `/`。
        dir = dir.replace(/\/+/g, '/');   //把多个 `/` 合成一个。

        //确保以 `/` 结束，统一约定，不易出错。
        if (!dir.endsWith('/')) {
            dir += '/';
        }

        return dir;
    }



    //静态方法
    return exports = {

        /**
        * 迭代指定的目录及所有子目录。
        */
        each: function (dir, fn) {
            dir = normalize(dir);

            if (!fs.existsSync(dir)) { //不存在该目录。
                return;
            }

            var files = [];
            var list = fs.readdirSync(dir);

            //先处理子目录。
            list.map(function (item, index) {

                item = dir + item;

                var stat = fs.statSync(item);
                var isFile = !stat.isDirectory();

                if (isFile) {
                    files.push(item);
                }
                else {
                    exports.each(item, fn);
                }
            });

            fn && fn(dir, files);

        },


        /**
        * 获取指定目录及子目录下的所有文件列表。
        * @return {Array} 返回符合条件的所有文件列表。
        */
        getFiles: function (dir) {
            var all = [];

            exports.each(dir, function (dir, files) {
                all.push(...files);
            });

            return all;
        },


        /**
        * 创建一个目录。
        * 如果父目录不存在，则会先递归地创建其父目录。
        */
        create: function (dir) {

            dir = dir.endsWith('/') ? dir.slice(0, -1) : path.dirname(dir);

            if (fs.existsSync(dir)) { //已经存在该目录
                return;
            }


            var parent = path.dirname(dir) + '/';

            if (!fs.existsSync(parent)) {
                exports.create(parent);
            }

            fs.mkdirSync(dir);
        },

        /**
        * 删除一个目录或多个目录。
        * 这将会删除该目录及子目录下的所有文件。
        * 已重载 delete(dir); 删除一个目录及其子目录。
        * 已重载 delete(dirs); 删除多个目录及其子目录。
        */
        delete: function (dir) {
            var dirs = Array.isArray(dir) ? dir : [dir];

            dirs.forEach(function (dir) {
                exports.each(dir, function (dir, files) {
                    //先把当前目录的文件全删掉。
                    files.forEach(function (file) {
                        fs.unlinkSync(file); //删除文件。
                    });

                    //最后删除当前目录。
                    fs.rmdirSync(dir);
                });
            });
        },

        /**
        * 清空当前目录中的所有文件和子目录，并保留当前目录。
        */
        clear: function (dir) {
            exports.each(dir, function (cwd, files) {
                //先把当前目录的文件全删掉。
                files.forEach(function (file) {
                    fs.unlinkSync(file); //删除文件。
                });

                console.log(cwd, dir);

                if (cwd != dir) {
                    fs.rmdirSync(cwd);
                }
               
            });
        },


        /**
        * 删除空目录（包括当前目录）。
        * 这将会递归地删除指定目录及子目录下的所有空目录。
        */
        trim: function (dir) {
            var dirs = [];  //要删除的目录项。

            exports.each(dir, function (dir, files) {

                var list = fs.readdirSync(dir);

                if (list.length == 0) { //空目录
                    try {
                        fs.rmdirSync(dir);
                    }
                    catch (ex) {
                        console.log(dir.red);
                        throw ex;
                    }

                    dirs.push(dir);
                }
            });

            return dirs;
        },

        /**
        * 复制目录。
        * 这将会递归地复制指定目录及子目录的所有文件。
        */
        copy: function (srcDir, destDir) {
            destDir = normalize(destDir);
            exports.create(destDir);

            var File = require('File');
            var list = fs.readdirSync(srcDir);

            list.forEach(function (item) {

                var src = srcDir + '/' + item;
                var dest = destDir + '/' + item;

                var stat = fs.statSync(src);
                var isFile = !stat.isDirectory();

                if (isFile) {
                    File.copy(src, dest);
                }
                else {
                    exports.copy(src, dest);
                }

            });


        },

    };

});
