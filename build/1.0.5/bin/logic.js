

start();


function start() {

    var master = require('web-master');

    master.launch(function (require, module, exports) {

        var $ = require('$');
        var $String = $.require('String');
        var Patterns = require('Patterns');
        var Path = require('Path');
        var Lines = require('Lines');
        var File = require('File');
        var HtmlLink = require('HtmlLink');
        var LogicHtml = require('LogicHtml');


        var options = {
            dir: '../htdocs/',
            patterns: [
                '**/*.html',
                '!package/**/*.html',
                '!**/index.html',
                '!**/*.master.html',
            ],
        };

        var logic = new LogicHtml(options);
        var files = Patterns.getFiles(options.dir, options.patterns);


        files.forEach(function (file) {
            var info = HtmlLink.parse({ 'file': file, });
            var list = info.list;
            var changed = false;

            list.forEach(function (item) {
                var prefix = item.props.prefix;
                var href = item.props.href;

                if (!prefix || !href) {
                    return;
                }

                var selector = $String.format('{prefix}="{href}"', {
                    'prefix': prefix,
                    'href': href,
                });

                var file = logic.get(selector);

                if (!file) {
                    console.log('找不到 '.bgRed, selector, '对应的文件'.bgRed);
                    return;
                }


                console.log(selector.bgMagenta);
                console.log(file.cyan);

                var s0 = ' prefix="' + prefix + '"';
                var s1 = ' href="' + href + '"';
                var line = item.line;

                href = Path.relative(info.dir, file);

                line = line.replace(s0, '');
                line = line.replace(s1, ' href="' + href + '"');

                console.log(item.line);
                console.log(line.green)

                info.lines[item.no] = line;
                changed = true;
            });

            if (changed) {
                var html = Lines.join(info.lines);
                File.write(file, html);
            }

        });

      
    });

}