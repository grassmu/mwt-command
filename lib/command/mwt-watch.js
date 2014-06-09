var wt = require("watch"),
    path = require("path"),
    fs = require("fs"),
    buildIndex = require("../kernel/task/buildIndex"),
    mwt = require("../kernel/global/kernel");

exports.usage = '-d [options] -n [options]';
exports.desc = "\t启动监控工程目录";

exports.registeCommand = function(commander) {
    commander
        .option('-d, --dirPath <dirPath>', '指定要监控的目录')
        .option('-n, --dirName <dirName>', '指定已注册的目录别名（优先级高）')
        .action(function (value) {
            var dirPath = value.dirPath || process.cwd(),
                dirName = value.dirName;

            if (dirName) {
                var configData = require("../../projectConfig.json"),
                    config = configData[dirName];
                if (config) {
                    dirPath = path.resolve(config.path + "\\" + dirName);
                } else {
                    // 再检查dirPath是否指定
                    if(dirPath && !mwt.util.validateDir(dirPath)) {
                        mwt.show.showError("找不到正确的监控根目录");
                        return;
                    }
                }
            }
            // 先判断配置文件是否存在
            fs.exists(path.resolve(dirPath+"\\config.json"), function(exist) {
                if(!exist) {
                    mwt.show.showError("config.json配置文件不存在");
                } else {
                    // 读取配置文件
                    mwt.projectConfig = mwt.util.readJson(path.resolve(dirPath + "\\config.json"));
                    mwt.projectDir = dirPath;
                    // 建立页面文件索引
                    buildIndex.templateBuild(dirPath);
                    return;
                    wt.watchTree(dirPath, function(f, curr, prev) {
                        if (typeof f == "object" && prev === null && curr === null) {
                            // Finished walking the tree
                        } else if (prev === null) {
                            // f is a new file
                        } else if (curr.nlink === 0) {
                            // f was removed
                        } else {
                            var file = path.basename(f),
                                ext = path.extname(f);
                            console.log(mwt.templateMap);
                            // 修改的文件未在map表里
                            if(!mwt.templateMap[file]) {

                            }
                        }
                    });
                }
            })
        });
}