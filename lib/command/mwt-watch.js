var wt = require("watch"),
    path = require("path"),
    fs = require("fs"),
    buildIndex = require("../kernel/task/buildIndex"),
    mwt = require("../kernel/global/kernel"),
    tplPath;

exports.usage = '-d [options] -n [options]';
exports.desc = "\t启动监控工程目录";

exports.registeCommand = function (commander) {
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
                    if (dirPath && !mwt.util.validateDir(dirPath)) {
                        mwt.show.showError("找不到正确的监控根目录");
                        return;
                    }
                }
            }
            mwt.util.configExist(dirPath, function () {
                // 读取配置文件
                var config = mwt.projectConfig = mwt.util.readJson(path.resolve(dirPath + "\\config.js"));
                mwt.projectDir = dirPath;
                tplPath = path.join(mwt.projectDir, mwt.projectConfig.template.baseDir);
                // 建立页面文件索引
                buildIndex.templateBuild(dirPath);
                wt.watchTree(dirPath, function (f, curr, prev) {
                    if (typeof f == "object" && prev === null && curr === null) {
                        // Finished walking the tree
                    } else if (prev === null) {
                        // f is a new file
                    } else if (curr.nlink === 0) {
                        // f was removed
                    } else {
                        var file = path.basename(f),
                            dirArr = f.replace(tplPath + "\\", "").split("\\"),
                            map = mwt.templateMap,
                            ext = path.extname(f);
                        // 需要编译dot模板
                        if (config.watch.dotCompile && ext == ".dot") {

                        }

                        switch (ext) {
                            case ".dot":
                            case ".shtml":
                            case ".html":
                            case ".htm":
                                break;
                            case ".js":
                            case ".css":
                                // TODO copy文件只server目录
                                break;
                        }

                        // 修改的文件未在map表里，则查找它的依赖
                        if (!map[dirArr[0]]) {

                        } else {
                            console.log(mwt.templateMap[dirArr[0]][file].dot)
                        }
                    }
                });
            });
        });
}