



module.exports = function (grunt) {

    grunt.file.defaultEncoding = 'utf8';


    var pkg = grunt.file.readJSON('../src/package.json');
    var dest = `../build/${pkg.version}`;


    

    grunt.initConfig({
        clean: {
            options: {
                force: true,
            },
            node_modules: [
                '../src/node_modules/',
                '../build/**/node_modules/',
            ],
        },

        copy: {
            dist: {
                files: [
                    {
                        expand: true,
                        cwd: '../src/',
                        src: ['*/**', '*'],
                        dest: dest,
                    },
                    {
                        expand: true,
                        cwd: '../',
                        src: ['readme.md'],
                        dest: dest,
                    },
                ],
                options: {
                    process: function (content, src, dest) {
                        console.log(src);

                        [
                            {
                                key: 'version',
                                value: pkg.version,
                            },

                        ].forEach(function (item) {
                            var key = item.key;
                            var begin = `/**{${key}*/`;     //如 `/**{version*/`
                            var end = `/**${key}}*/`;       //如 `/**version}*/`
                            var value = `'${item.value}'`;  //如 `'1.6.1'`

                            content = replaceBetween(content, begin, end, value);

                        });



                        return content;
                    },
                },
            },
        },
    });

    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');

    grunt.registerTask('default', ['clean', 'copy']);


    //替换区间内容。
    function replaceBetween(s, beginTag, endTag, value) {
        if (s.indexOf(beginTag) < 0 || s.indexOf(endTag) < 0) {
            return s;
        }

        var list = s.split(beginTag).map(function (item) {

            var a = item.split(endTag);

            if (a.length == 1) {
                return a[0];
            }

            return value + a.slice(1).join(endTag);

        });


        s = list.join('');

        return s;
    }

};