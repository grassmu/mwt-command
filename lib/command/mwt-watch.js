var wt = require("watch"),
    path = require("path"),
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

            // 建立页面文件索引
            buildIndex.templateBuild(dirPath);

            wt.watchTree(dirPath, function(f, curr, prev) {
                if (typeof f == "object" && prev === null && curr === null) {
                    // Finished walking the tree
                } else if (prev === null) {
                    // f is a new file
                } else if (curr.nlink === 0) {
                    // f was removed
                } else {
                    var extName = path.extname(f);
                    switch(extName) {

                    }
                }
            });
        });
}