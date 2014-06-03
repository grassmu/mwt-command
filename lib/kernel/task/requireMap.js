/**
 * 生成依赖map文件
 * @type {$|exports}
 */
var fileUtil = require("../global/fileUtil"),
    util = require("../global/util"),
    path = require("path"),
    config = require("./config");

module.exports = function (list, fileData, mainPath) {
    var obj = {};
    obj[mainPath] = {};
    console.log("generate require map file" + mainPath + "_require_map.json");
    list.forEach(function (moduleName) {
        obj[mainPath][moduleName] = util.md5(fileData[moduleName].data);
    });
    fileUtil.writeFileSync(config.compileDir + "/" + mainPath + "_require_map.json", JSON.stringify(obj), "utf-8");
}