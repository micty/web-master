

define('Watcher/Events/Log', function (require, module, exports) {

    var desc$file$item = {};
    

    return {
        add: function (desc, file, fn) {
            //console.log(desc.cyan, file);
            //fn();
            //return;


            var file$item = desc$file$item[desc];

            if (!file$item) {
                file$item = desc$file$item[desc] = {};
            }


            var item = file$item[file];

            if (item) {
                item.list.push(fn);
                clearTimeout(item.tid);
            }
            else {
                item = file$item[file] = {
                    'list': [fn],
                    'tid': null,
                };
            }


            item.tid = setTimeout(function () {
                console.log(desc.cyan, file);

                item.list.forEach(function (fn) {
                    fn();
                });

                delete file$item[file];

            }, 200);
        },
    };

    

});




