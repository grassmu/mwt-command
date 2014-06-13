var path = require("path"),
    fs = require("fs"),
    mwt = require("../kernel/global/kernel"),
    combo = require("../kernel/task/combo"),
    comboCmd = require("../kernel/task/combo-cmd");

exports.desc = "\t编译项目文件，不指定参数则在当前目录下执行";
exports.usage = "[dirPath] [option] [dirName] [option]";

exports.registeCommand = function (commander) {
    commander
        .option('-d, --dirPath <dirPath>', '要编译的目录路径')
        .option('-n, --dirName <dirName>', '已注册的目录别名（优先于dirPath）')
        .option('-t, --type <type>', '要打包的类型（js|template），默认是template')
        .option('-c, --cmd <cmd>', '是否使用模块化方式编译文件，默认为true')
        .action(function (value) {
            var configData = require("../../projectConfig.json"),
                dirPath = value.dirPath || process.cwd(),
                type = value.type || "template",
                dirName = value.dirName,
                cmd = value.cmd;

            if (dirName) {
                var config = configData[dirName];
                if (config) {
                    cmd = config.seajs;
                    dirPath = path.resolve(config.path + "\\" + dirName);
                } else {
                    mwt.show.showError("找不到匹配的项目配置");
                    return;
                }
            }

            // 如果没有指定cmd参数，则取项目配置map中的设置
            if(!cmd && configData.seajs) {
                cmd = configData.seajs;
            }
            cmd = false;
            fs.exists(path.resolve(dirPath+"\\config.js"), function(exist) {
                if(!exist) {
                    mwt.show.showError("config.js配置文件不存在");
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