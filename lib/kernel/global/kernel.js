var mwt = module.exports = {};

var commandList = ["init", "registe", "update", "compile", "use", "watch"];
// 当前需要打包的文件json数据， Object
mwt.compileFileData = null;
// 依据配置生成的打包列表，与compileFileData结合使用, Array
mwt.compileList = null;
// 当前工程的配置文件信息
mwt.projectConfig = null;
// 当前工程的绝对路径
mwt.projectDir = null;
// 当前工程的编译临时目录
mwt.tempDir = null;

mwt.show = require("./show");

mwt.util = require("./util");

mwt.config = require(__dirname + "/config.json");

mwt.fs = require("./fileUtil");

mwt.us = require("underscore");

/**
 * 获取命令列表
 * @returns {string[]}
 */
mwt.getCommand = function() {
    return commandList;
}
/**
 * TODO 新增一个命令，但是需要在lib目录新新增该文件
 * @param name
 */
mwt.addCommand = function(name) {
    commandList.push(name);
}