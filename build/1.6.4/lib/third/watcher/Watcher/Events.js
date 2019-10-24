

define('Watcher/Events', function (require, module, exports) {
    var Path = require('Path');
    var MD5 = require('MD5');
    var fs = require('fs');
    var Log = module.require('Log');

    var list = [
        { name: 'add', event: 'added', desc: '创建新文件', },
        { name: 'delete', event: 'deleted', desc: '文件被删除', },
        { name: 'modify', event: 'changed', desc: '文件被修改', },
        { name: 'rename', event: 'renamed', desc: '文件重命名', },
    ];


    //检查是否需要进一步触发事件。
    //如果不需要，则返回 false 以进行拦截。
    function checkValid(meta, name, file) {


        if (!meta.emitter.has(name)) {
            return null;
        }

        if (name == 'delete') {
            return true;
        }

        if (!fs.existsSync(file)) {
            return false;
        }


        var stat = fs.statSync(file);

        if (stat.isDirectory()) {
            return false;
        }



        //在某些编辑器里，内容没发生变化也可以保存，
        //只会刷新修改时间，从而触发 changed 事件。
        if (name == 'modify') {
            var md5 = MD5.read(file);

            if (md5 == meta.file$md5[file]) {
                return false;
            }

            meta.file$md5[file] = md5;

            return true;
        }

        var stat = fs.statSync(file);
        var isFile = !stat.isDirectory();

        return isFile;

    }



    return exports = {

        bind: function (meta, fn) {
            //这里需要绑定一次，否则发生错误时会直接抛出到外部而导致程序中止。
            meta.watcher.on('error', function (error) {
                //console.log(error);
            });

            list.forEach(function (item) {
                var tid = null;
                var files = new Set();

                meta.watcher.on(item.event, function (file) {
                    file = Path.relative('./', file);

                    var valid = checkValid(meta, item.name, file);

                    if (!valid) {
                        return;
                    }


                    clearTimeout(tid);
                    files.add(file);//增加一条记录


                    //把同一个文件同个类型的事件要打印的日志，合并成一条打印，然后分别执行回调函数。
                    //避免出现多条完全相同的日志连续出现。
                    Log.add(item.desc, file, function () {


                        //这里用的是异步方式，当前实例可能已给 destroy() 掉了。
                        //因此需要判断 meta.emitter 是否还存在。
                        tid = setTimeout(function () {
                            var emitter = meta.emitter;

                            if (!emitter) {
                                files.clear();
                                files = null;
                                return;
                            }


                            var list = [...files];
                            var file$md5 = {};

                            list.forEach(function (file) {
                                file$md5[file] = meta.file$md5[file];
                            });

                            files.clear();
                            emitter.fire(item.name, [list, file$md5]);
                            fn && fn();

                        }, 500);
                    });

                    
                });

            });

        },


    };

    

});




