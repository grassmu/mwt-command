/**
 * 获取文件注释声明信息
 * @param data
 * @returns {{isMain: (boolean|*), isPublic: (Array|{index: number, input: string}|boolean), isBusiness: (Array|{index: number, input: string}|boolean), groupNum: (Array|{index: number, input: string}|*|null), compileName: (Array|{index: number, input: string}|*|null), alone: boolean}}
 */

module.exports = function (data) {
    var mainReg = /@data-main/,
        compileNameReg = /@file-name\s*=\s*(\S+)/,
        fileGroupReg = /@file-group\s*=\s*(\S+)/,
        fileAloneReg = /@file-alone/,
        fileTypeReg = /@file-type\s*=\s*(\S+)/;

    var compileNameArr = data.match(compileNameReg),
        fileGroupArr = data.match(fileGroupReg),
        fileTypeArr = data.match(fileTypeReg);

    return {
        "isMain": mainReg.test(data),
        "isPublic": fileTypeArr && fileTypeArr[1] == "public" || false,
        "isBusiness": fileTypeArr && fileTypeArr[1] == "business" || false,
        "groupNum": fileGroupArr && fileGroupArr[1] || null,
        "compileName": compileNameArr && compileNameArr[1] || null,
        "alone": fileAloneReg.test(data)
    };
}