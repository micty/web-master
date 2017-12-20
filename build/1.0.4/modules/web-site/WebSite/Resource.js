
/**
* 
*/
define('WebSite/Resource', function (require, module, exports) {

    var File = require('File');
    var Patterns = require('Patterns');
    var Directory = require('Directory');
    var Log = require('Log');
    var Js = require('Js');


    function clear(desc, cwd, patterns) {
        if (!patterns) {
            return;
        }

        var dirs = [];
        var files = [];

        patterns.forEach(function (item) {
            if (item.startsWith('!') || item.includes('*') || !item.endsWith('/')) {
                files.push(item);
            }
            else {
                dirs.push(cwd + item);
            }
        });

        files = Patterns.getFiles(cwd, files);


        if (dirs.length > 0) {
            Directory.delete(dirs);
            Log.seperate();
            console.log(desc.bgMagenta, dirs.length.toString().cyan, '个目录:');
            Log.logArray(dirs, 'gray');
        }
        
        if (files.length > 0) {
            File.delete(files);
            Log.seperate();
            console.log(desc.bgMagenta, files.length.toString().cyan, '个文件:');
            Log.logArray(files, 'gray');
        }
    }



    return {

        /**

        */
        init: function (meta) {
            var htdocs = meta.htdocs;
            var cwd = meta.cwd;
            var css = cwd + meta.css;

            console.log('删除目录'.bgYellow, cwd.yellow);
            Directory.delete(cwd);

            console.log('复制目录'.bgMagenta, htdocs.green, '→', cwd.cyan);
            Directory.copy(htdocs, cwd);

            //先删除自动生成的目录，后续会再生成回来。
            Directory.delete(css);

           
        },

     

        /**
        * dir: 网站根目录。
        * key$fn: 处理规则映射表，是一个 { key: fn ,} 的集合。
        *
        */
        process: function (dir, key$fn) {
            key$fn = key$fn || {};

            //key 可能是一个路径模式，如 `**/*.js`。

            Object.keys(key$fn).forEach(function (key) {
                var fn = key$fn[key];
                var files = Patterns.getFiles(dir, key);

                files.forEach(function (file) {
                    var content = File.read(file);

                    content = fn(file, content, require);

                    if (content === null) { //只有明确返回 null 才删除。
                        File.delete(file);
                    }
                    else {
                        File.write(file, content, null);
                    }
                });

            });

        },

        /**
        * 排除。
        */
        exclude: function (cwd, patterns) {
            clear('排除', cwd, patterns);
        },

        /**
        * 清理。
        */
        clean: function (cwd, patterns) {
            clear('清理', cwd, patterns);

            //递归删除空目录
            var dirs = Directory.trim(cwd);

            Log.seperate();
            console.log('清理'.bgMagenta, dirs.length.toString().cyan, '个空目录:');
            Log.logArray(dirs, 'gray');
        },

    };




});




