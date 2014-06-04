var wmt = require("../kernel/global/kernel"),
    fs = require("fs");
/**
 * 使用已配置的项目，切换后监控就在指定的project目录下进行
 * @param module
 * @param fn
 */

exports.usage = '[path] [options] [nick] [options]';
exports.desc = "切换工程目录";
exports.registeCommand = function(commander) {
    commander
        .option('-n, --nickName <nickName>', '别名')
        .action(function (value) {
            var nick = value.nickName;
            fs.readFile("../projectConfig.json", "utf-8", function(err, data) {
                if(err) {
                    wmt.show.showError("read project config error, please try again!");
                    return;
                }
                data = JSON.parse(data);
                if(!data[nick]) {
                    wmt.show.showError("can't find matched project!");
                    return;
                }
                // 写入到当前项目
                wmt.currentProject = data[nick];
                wmt.show.showResult("已切换至"+ nick);
            });
        })
}
