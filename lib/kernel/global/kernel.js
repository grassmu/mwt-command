var wmt = module.exports = {};

// 当前需要打包的文件json数据， Object
wmt.compileFileData = null;
// 依据配置生成的打包列表，与compileFileData结合使用, Array
wmt.compileList = null;
// 当前工程的配置文件信息
wmt.projectConfig = null;
// 当前工程的绝对路径
wmt.projectDir = null;
// 当前工程的编译临时目录
wmt.tempDir = null;

wmt.show = require("./show");

wmt.util = require("./util");

wmt.config = require(__dirname + "/config.json");

wmt.fs = require("./fileUtil");

wmt.us = require("underscore");