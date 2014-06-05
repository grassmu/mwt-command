var mwt = require("../global/kernel"),
    path = require("path"),
    encoding = "utf-8",
    tempDir,
    config,
    fileData,
    fileList;
/**
 * 合并全部的文件
 */
exports.concatAll = function (callback) {
    initParam();
    var tempData = '',
        compileFileName = mwt.projectDir.substr(mwt.projectDir.lastIndexOf("\\") + 1, mwt.projectDir.length);
    fileList.forEach(function (item) {
        console.log("concating " + item);
        tempData += fileData[item].data + "\n";
    });
    // 写文件到临时目录
    mwt.fs.writeFileSync(tempDir + "\\" + (config.compileName || compileFileName) + ".js", tempData, encoding);
    console.log(fileList.length + " files concated");
    callback();
}

/**
 * 每个业务文件与公共文件合并
 */
exports.concatSeperate = function (callback) {
    initParam();
    var len = fileList.length;

    fileList.forEach(function (fl) {
        var tempData = '', dirName, file;
        fl.forEach(function (fileName) {
            tempData += fileData[fileName].data + "\n";
            dirName = fileData[fileName].dirName;
            file = fileName;
            if(fileData[file].compileName) {
                file = fileData[file].compileName;
            }
        });
        dirName = path.basename(dirName);
        // 写文件到临时目录
        mwt.fs.writeFile(tempDir + "\\" + dirName + "\\" + file, tempData, encoding, function () {
            len--;
            console.log("concat " + file + " success");
            if(!len) {
                callback();
            }
        });
    });
}

/**
 * single模式打包
 * @param callback
 */
exports.concatSingle = function(callback) {
    initParam();
    var len = fileList.length;
    fileList.forEach(function (fl) {
        var tempData = '', dirName, file;
        fl.forEach(function (fileName) {
            tempData += fileData[fileName].data + "\n";
            dirName = fileData[fileName].dirName;
            file = fileName;
            if(fileData[fileName].compileName) {
                file = fileData[fileName].compileName;
            }
        });
        dirName = path.basename(dirName);
        // 写文件到临时目录
        mwt.fs.writeFile(tempDir + "\\" + dirName + "\\" + file, tempData, encoding, function () {
            len--;
            console.log("concat " + file + " success");
            if(!len) {
                callback();
            }
        });
    });
}

function initParam() {
    fileList = mwt.compileList;
    fileData = mwt.compileFileData;
    config = mwt.projectConfig.javascript;
    mwt.tempDir = tempDir = path.join(mwt.projectDir, mwt.config.tempDirName);
}