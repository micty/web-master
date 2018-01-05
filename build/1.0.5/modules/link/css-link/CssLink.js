
/**
* 静态引用 css 资源文件。
*/
define('CssLink', function (require, module, exports) {

    var $ = require('$');
    var Defaults = require('Defaults');
    var MD5 = require('MD5');
    var Css = require('Css');
    var Emitter = $.require('Emitter');

    var Meta = module.require('Meta');
    var Parser = module.require('Parser');
    var Watcher = module.require('Watcher');
    var Builder = module.require('Builder');

    var mapper = new Map();


    /**
    * 构造器。
    *   config = {
    *       file: '',   //输入的源 css 文件路径。
    *   };
    */
    function CssLink(config) {
        config = Defaults.clone(module.id, config);

        var emitter = new Emitter(this);

        var meta = Meta.create(config, {
            'this': this,
            'emitter': emitter,
        });


        mapper.set(this, meta);

        Object.assign(this, {
            'id': meta.id,
            'data': {},     //用户的自定义数据容器。
        });

    }



    CssLink.prototype = {
        constructor: CssLink,

        data: {},

        /**
        * 渲染生成 html 内容。
        *   内联: `<style>...</style>`。
        *   普通: `<link href="xx.css" rel="stylesheet" />`。
        *   options = {
        *       inline: false,      //是否内联。
        *       tabs: 0,            //缩进的空格数。
        *       href: '',           //生成到 link 标签中的 href 属性值。
        *       md5: 4,             //添加到 href 中 query 部分的 md5 的长度。
        *       query: {} || fn,    //添加到 href 中 query 部分。
        *       props: {},          //生成到标签中的其它属性。
        *    };
        */
        render: function (options) {
            var meta = mapper.get(this);

            //只有明确指定了内联，且为内部文件时，才能内联。
            if (options.inline && !meta.external) {
                var html = Css.inline({
                    'file': meta.file,
                    'comment': true,
                    'props': options.props,
                    'tabs': options.tabs,
                });

                return html;
            }

            //普通方式。
            var md5 = options.md5 || 0;
            var href = options.href;
            var query = options.query || {};

            if (typeof query == 'function') {
                query = query(meta.output);
            }

            if (!meta.external) {
                md5 = md5 === true ? 32 : md5;  //md5 的长度。

                if (md5 > 0) {
                    md5 = MD5.read(meta.file, md5); //md5 串值。
                    query[md5] = undefined; //这里要用 undefined 以消除 `=`。
                }
            }


            var html = Css.mix({
                'href': href,
                'tabs': options.tabs,
                'props': options.props,
                'query': query,
            });

            return html;
        },


        /**
        * 监控。
        */
        watch: function () {
            var meta = mapper.get(this);

            if (meta.watcher) {
                return;
            }

            meta.watcher = Watcher.create(meta);


        },

        /**
        * 绑定事件。
        */
        on: function (name, fn) {
            var meta = mapper.get(this);
            meta.emitter.on(...arguments);
        },

        /**
        * 销毁当前对象。
        */
        destroy: function () {
            var meta = mapper.get(this);
            if (!meta) { //已销毁。
                return;
            }

            meta.emitter.destroy();
            meta.watcher && meta.watcher.destroy();
            mapper.delete(this);
        },




    };


    Object.assign(CssLink, {
        'parse': Parser.parse,
        'build': Builder.build,
    });

    return CssLink;



});




