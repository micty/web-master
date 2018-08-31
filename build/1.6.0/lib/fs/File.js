﻿
/**
* 文件类。
*/
define('File', function (require, module, exports) {
    var fs = require('fs');
    var iconv = require('iconv-lite');


    return exports = {

        /**
        * 判断是否存在指定的文件。
        */
        exists: function (file) {
            return fs.existsSync(file);
        },

        /**
        * 读取一个文件。
        * 可以指定使用指定的编码，否则默认为 `utf8`。
        * 已重载 read(file);           //使用 `utf8` 的编码方式读取内容。
        * 已重载 read(file, null);     //读取 buffer 形式的内容。
        * 已重载 read(file, encoding); //使用指定的编码读取一个内容。
        */
        read: function (file, encoding) {
            encoding = encoding === null ? null : encoding || 'utf8'; //有可能为 undefined

            try{
                var contents = fs.readFileSync(file); //读到的是 buffer。

                //如果指定了 encoding， 则把内容从 buffer 形式转成 string 形式。
                if (encoding) {
                    contents = iconv.decode(contents, encoding); //解码成 string。

                    // strip any BOM that might exist.
                    if (contents.charCodeAt(0) === 0xFEFF) {
                        contents = contents.slice(1);
                    }
                }

                return contents;
            }
            catch (ex) {
                switch (ex.code) {
                    case 'EISDIR':
                        console.error('要读取的文件路径', file.yellow, '是一个目录。');
                        break;

                    case 'ENOENT':
                        console.error('要读取的文件路径', file.yellow, '不存在。');
                        break;
                }

                console.error(ex);
                throw ex;
            }

        },

        /**
        * 写入一个文件。
        * 已重载 write(file, contents);            //使用 `utf8` 的编码方式写入内容。
        * 已重载 write(file, contents, null);      //不输出 log。
        * 已重载 write(file, contents, encoding);  //使用指定的编码写入内容。
        */
        write: function (file, contents, encoding) {
            var Directory = require('Directory');

            //先创建目录。
            Directory.create(file);

            // If contents is already a Buffer, don't try to encode it
            if (!Buffer.isBuffer(contents)) {
                contents = iconv.encode(contents, encoding || 'utf8'); //编码成 buffer。
            }


            fs.writeFileSync(file, contents);

            //当指定为 null 时，表示是复制而写入的，不输出 log。
            if (encoding !== null) {
                console.log('写入'.bgYellow, file.yellow);
            }
        },

        /**
        * 向一个文件追加内容。
        * 已重载 append(file, contents);            //使用 `utf8` 的编码方式追加内容。
        * 已重载 append(file, contents, null);      //不输出 log。
        * 已重载 append(file, contents, encoding);  //使用指定的编码追加内容。
        */
        append: function (file, contents, encoding) {
            var Directory = require('Directory');

            Directory.create(file);

            // If contents is already a Buffer, don't try to encode it
            if (!Buffer.isBuffer(contents)) {
                contents = iconv.encode(contents, encoding || 'utf8'); //编码成 buffer。
            }

            fs.appendFileSync(file, contents);

            //当指定为 null 时，不输出 log。
            if (encoding !== null) {
                console.log('写入'.bgYellow, file.yellow);
            }
        },

        /**
        * 复制一个文件。
        */
        copy: function (src, dest) {
            var buffers = exports.read(src, null); //读到的是 buffer。

            exports.write(dest, buffers, null);

        },

        /**
        * 删除一个或多个文件。
        * 已重载 delete(file);     //删除单个文件。
        * 已重载 delete(files);    //批量删除多个文件。
        */
        delete: function (file) {
            //重载 delete( [] );
            if (Array.isArray(file)) {
                file.forEach(exports.delete);
                return;
            }

            if (!fs.existsSync(file)) {
                return;
            }

            fs.unlinkSync(file);
        },

        /**
        * 读取一个 JSON 文件，解析其内容，并返回对应的对象。
        */
        readJSON: function (file) {
            if (!fs.existsSync(file)) {
                return;
            }

            var json = exports.read(file);

            if (!json) {
                return;
            }

            json = JSON.parse(json);

            return json;
        },

        /**
        * 写入一个 JSON 文件。
        * 可以指定是否压缩。
        */
        writeJSON: function (file, json, minify) {
            json = minify ?
                JSON.stringify(json) :
                JSON.stringify(json, null, 4);

            exports.write(file, json);
        },
    };

});
