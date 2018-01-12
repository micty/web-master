
///**
//* 
//*/
//define('LogicHtml/Parser', function (require, module, exports) {

//    var $ = require('$');
//    var $Object = $.require('Object');
//    var File = require('File');
//    var Patterns = require('Patterns');

//    //add file
//    function add(meta, file) {
//        var keys = [];
//        var html = File.read(file);

//        meta.file$html[file] = html;


//        $Object.each(meta.key$files, function (key, files) {
//            if (!html.includes(key)) { //html 内容中是否包含特征串。
//                return;
//            }

//            if (files.length > 0) {
//                console.log('以下文件都含有特征内容: '.bgRed, key.cyan);
//                Log.logArray([...files, file], 'yellow');
//                throw new Error();
//            }

//            files.push(file);
//            keys.push(key);

//        });

//        return keys;
//    }



//    return {


//        /**
//        * 解析。
//        */
//        parse: function (meta) {
//            var files = Patterns.getFiles(meta.patterns);

//            files.forEach(function (file) {
//                if (file in meta.file$html) {
//                    return;
//                }

//                add(meta, file);
//            });
            



//        },

       
//    };
    
//});


