
/**
* 
*/
define('MasterPage/defaults', function (require, module, exports) {
    

    return {
        //标记批量动态引入 less、html、js 的区块的开始标记和结束标记。 
        tags: {
            less: {
                begin: '<!--weber.less.begin-->',
                end: '<!--weber.less.end-->',
            },
            html: {
                begin: '<!--weber.html.begin-->',
                end: '<!--weber.html.end-->',
            },
            js: {
                begin: '<!--weber.js.begin-->',
                end: '<!--weber.js.end-->',
            },
        },
    };

});


