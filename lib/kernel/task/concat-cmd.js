var config = require("./config"),
    fileUtil = require("../global/fileUtil"),
    util = require("../global/util"),
    rmap = require("./requireMap"),
    encoding = "utf-8";

/**
 *
 * @param list      主文件的依赖列表
 * @param fileData  文件内容的map
 * @param mainPath  主文件path
 */
function concat(list, fileData, mainPath) {
    // 读取种子文件，合并进去
    var seedFile = fileUtil.readFileSync(__dirname + "/seed.js", "utf-8");
    if (!seedFile) {
        throw new Error("读取种子文件失败，合并文件失败");
        return;
    }
    var concatData = seedFile + "\n";
    list.forEach(function (moduleName) {
        var data = fileData[moduleName].data;
        concatData += data + "\n";
    });
    concatData += fileData[mainPath].data;
    // 写文件到指定目录中
    fileUtil.writeFileSync(config.compileDir + "/" + mainPath + fileData[mainPath].ext, concatData, encoding);
    concatData = null;
    rmap(list, fileData, mainPath);
}

module.exports = concat;