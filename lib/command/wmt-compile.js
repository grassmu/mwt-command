var path = require("path"),
    fs = require("fs"),
    wmt = require("../kernel/global/kernel"),
    combo = require("../kernel/task/combo"),
    comboCmd = require("../kernel/task/combo-cmd");

exports.desc = "编译项目文件，不指定参数则在当前目录下执行";
exports.usage = "[dirPath] [option] [dirName] [option]";

exports.registeCommand = function (commander) {
    commander
        .option('-d, --dirPath <dirPath>', '要编译的目录路径')
        .option('-n, --dirName <dirName>', '已注册的目录别名（优先于dirPath）')
        .option('-t, --type <type>', '要打包的类型（js|template），默认是template')
        .option('-c, --cmd <cmd>', '是否使用模块化方式编译文件，默认为true', true)
        .action(function (value) {
            var dirPath = value.dirPath || process.cwd(),
                type = value.type || "template",
                dirName = value.dirName,
                cmd = wmt.util.getBoolean(value.cmd);

            if (dirName) {
                var configData = require("../../projectConfig.json"),
                    config = configData[dirName];
                if (config) {
                    cmd = config.seajs;
                    dirPath = path.resolve(config.path + "\\" + dirName);
                } else {
                    wmt.show.showError("找不到匹配的项目配置");
                    return;
                }
            }

            fs.exists(path.resolve(dirPath+"\\config.json"), function(exist) {
                if(!exist) {
                    wmt.show.showError("config.js配置文件不存在");
                } else {
                    var justJs = type == "js" ? true : false;
                    if(cmd) {
                        comboCmd.run(dirPath);
                    } else {
                        combo.run(dirPath, justJs);
                    }
                }
            })
        });
}