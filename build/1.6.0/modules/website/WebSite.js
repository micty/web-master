
/**
* 网站类。
* 事件：
*   ('parse', 'master');
*   ('render', 'master');
*   ('render', 'js-link');
*   ('compile', 'js-block');
*   ('build', 'js-block');
*   ('watch');
*   ('build');
*/
define('WebSite', function (require, module, exports) {
    var $ = require('$');
    var Defaults = require('Defaults');
    var Log = require('Log');
    var Watcher = require('Watcher');

    var Tasks = $.require('Tasks');
    var Emitter = $.require('Emitter');

    var Meta = module.require('Meta');
    var Masters = module.require('Masters');
    var Packages = module.require('Packages');
    var Resource = module.require('Resource');
    


    var mapper = new Map();

    /**
    * 构造器。
    *   config = {
    *       htdocs: '',     //网站的根目录。 如 `../htdocs/`，相对于运行脚本所在的目录。
    *       css: '',        //网站的样式目录。 如 `style/css/`，相对于网站的根目录。
    *       url: '',        //通过 open 命令要打开的网站的地址模板。 如 `http://{host}/{dir}index.html`。
    *       qr: {           //打开二维码的配置信息。
    *           width: 0,   //二维码图片的大小。 如 380。
    *           url: '',    //生成二维码的页面。 如 `http://qr.topscan.com/api.php`
    *       },
    *       packages: {         //
    *           patterns: [],   //
    *           dest: {         //
    *               dir: '',    //
    *               file: '',   //
    *           },               
    *       },
    *       masters: {          //
    *           patterns: [],   //
    *           dest: '',       //如 `{name}.html`。
    *       },
    *
    *   };
    */
    function WebSite(config) {
        config = Object.assign({}, config);

        var emitter = new Emitter(this);

        var meta = Meta.create(config, {
            'emitter': emitter,
            'this': this,
        });


        mapper.set(this, meta);


    }

    //实例方法。
    WebSite.prototype = {
        constructor: WebSite,

        /**
        * 解析。
        */
        parse: function () {
            //要从母版页中减去包中所引用的资源文件。
            var meta = mapper.get(this);
            var packages = meta.PackageBlock = Packages.parse(meta);
            var excludes = packages ? packages.get('type$patterns') : [];

            var masters = meta.MasterBlock = Masters.parse(meta, {
                'excludes': excludes,
            });

        },

        /**
        * 编译整个站点，完成后开启监控。
        *   options = {
        *       packages: {             //针对 packages 的配置节点。
        *           minify: false,      //是否压缩。
        *           name: '{name}',     //输出的文件名，支持 `{name}`: 当前的包名、`{md5}`: 内容的 md5 值两个模板字段。
        *           query: {            //生成到 href 中的 query 部分。
        *               md5: 4,         //md5 的长度。
        *           },
        *       },
        *       masters: {
        *           
        *       },
        *   };
        */
        watch: function (options) {
            options = options || {};

            var done = typeof options == 'function' ? options : options.done;
            var meta = mapper.get(this);
            var cwd = meta.cwd = meta.htdocs;

            Packages.init(meta);
            this.parse();

            Packages.watch(meta, {
                'options': options.packages,

                'change': function () {
                    Watcher.log();
                },

                'done': function () {
                    Masters.watch(meta, {
                        'options': options.masters,

                        'done': function () {
                            Log.allDone('全部编译完成');
                            meta.emitter.fire('watch');
                            Watcher.log();
                        },
                    });
                },
            });
        },


        /**
        * 构建整个站点。
        *   options = {
        *       dir: '',        //构建整个站点的输出目录。
        *       excludes: [],   //构建前要排除在外的文件或目录，路径模式数组。
        *       cleans: [],     //构建完成后需要清理的文件或目录，路径模式数组。
        *       process: {},    //需要单独处理和转换内容的文件处理器。
        *       packages: {             //
        *           minify: true,       //是否压缩。
        *           name: '{md5}',      //输出的文件名，支持 `{name}`: 当前的包名、`{md5}`: 内容的 md5 值两个模板字段。
        *           begin: '',          //可选。 合并 js 的闭包头文件。
        *           end: '',            //可选。 合并 js 的闭包的尾文件。
        *           query: {},          //生成到 href 中的 query 部分。
        *       },   
        *       masters: {              //
        *           lessLink: {},
        *           lessBlock: {},
        *           jsBlock: {},   
        *           html: {},
        *       },
        *   };
        */
        build: function (options) {
            options = options || {};

            var done = typeof options == 'function' ? options : options.done;
            var meta = mapper.get(this);
            var cwd = meta.cwd = options.dir;
            
            Resource.init(meta);
            Resource.exclude(cwd, options.excludes);

            Packages.init(meta);
            Resource.process(cwd, options.process);



            this.parse();

            Packages.build(meta, {
                'options': options.packages,

                'done': function () {
                    Masters.build(meta, {
                        'options': options.masters,

                        'done': function () {
                            Resource.clean(cwd, options.cleans);
                            Log.allDone('全部构建完成');
                            meta.emitter.fire('build');
                        },
                    });
                },
            });
         
        },


        /**
        * 打开站点页面。
        *   options = {
        *       host: '',   //可选。 要打开的域名，如 `localhost`。 如果不指定，则获取本机的 ip 地址作为 host。
        *       dir: '',    //可选。 网站所在的目录。
        *       query: {},  //可选。 要附加到 url 的 query 部分。
        *   };
        */
        open: function (options) {
            var meta = mapper.get(this);
            var Url = require('Tools.Url');

            Url.open({
                'tips': '打开页面',
                'sample': meta.url,
                'host': options.host,
                'dir': options.dir || meta.cwd,
                'query': {},
            });
        },

        /**
        * 打开站点对应的二维码页面以获取二维码。
        *   options = {
        *       width: 400,     //可选。 二维码的宽度。
        *       host: '',       //可选。 要打开的域名，如 `localhost`。 如果不指定，则获取本机的 ip 地址作为 host。
        *       dir: '',        //可选。 网站所在的目录。
        *       query: {},      //可选。 要附加到 url 的 query 部分。
        *   };
        */
        openQR: function (options) {
            options = options || {};

            var meta = mapper.get(this);
            var Url = require('Tools.Url');

            //本网站的 url。
            var url = Url.get({
                'sample': meta.url,
                'host': options.host,
                'dir': options.dir || meta.cwd,
                'query': options.query,
            });

            var qr = meta.qr;
            var width = options.width || qr.width;

            Url.open({
                'tips': '打开二维码',
                'sample': qr.url,
                'query': {
                    'w': width,
                    'text': url,
                },
            });
        },


        /**
        * 绑定事件。
        */
        on: function (name, fn) {
            var meta = mapper.get(this);
            meta.emitter.on(...arguments);
        },

        /**
        * 销毁。
        */
        destroy: function () {
            var meta = mapper.get(this);
            if (!meta) {
                return;
            }

            meta.emitter.destroy();

        },
    };


    return WebSite;

});




