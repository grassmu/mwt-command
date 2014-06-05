var fs = require("fs"),
    color = require("colors"),
    path = require("path"),
    data;

exports.desc = "\t注册工程目录";
exports.usage = "registe [path] [options] [nick] [options]";
exports.registeCommand = function(commander) {
    commander
        .option('-d, --dirPath <dirPath>', '要注册的目录路径')
        .option('-n, --dirName <dirName>', '目录别名')
        .option('-s, --seajs <seajs>', '是否使用seajs')
        .action(function(value) {
            var seajs = value.seajs || true,
                dirName = value.dir,
                nickName = value.nickName;
            doRegiste(nickName, dirName, seajs, function() {

            });
        });
}

function doRegiste(nickName, dir, seajs, fn) {
    var exists = fs.existsSync(dir);
    if(!exists) {
        fn("invalid absolute path, please input again!");
        return;
    }
    fs.exists("../projectConfig.json", function(exists) {
        // 配置文件不存在
        if(!exists) {
            data = {};
            data[nickName] = {
                path: dir,
                seajs: seajs
            };
            fs.writeFile("../projectConfig.json", JSON.stringify(data), "utf-8", function(){
                fn();
            });
        } else {
            fs.readFile("../projectConfig.json", "utf-8", function(err, data) {
                if(err) {
                    console.log("save config error".yellow);
                }
                data = data ? JSON.parse(data) : {};
                data[nickName] = {
                    path: path.resolve(dir),
                    seajs: seajs
                };
                fs.writeFile("../projectConfig.json", JSON.stringify(data), "utf-8", function(){
                    fn();
                });
            })
        }
    });
}

exports.doRegiste = doRegiste;
