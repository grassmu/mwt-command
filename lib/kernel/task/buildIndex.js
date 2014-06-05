var mwt = require("../global/kernel"),
    path = require("path"),
    config;

function buildIndex(dirPath) {
    config = mwt.util.readJson(path.resolve(dirPath + "\\config.json"));
    // 记录下工程相关的信息
    mwt.projectDir = dirPath;
    mwt.projectConfig = config;

}

exports.templateBuild = buildIndex;
