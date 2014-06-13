module.exports = {
    "javascript": {
        "baseDir": "./assets/js",
        "publicSeq": ["zepto.js", "common.js"],
        "clean": true,
        "packageType": "single",
        "dest":"./publish"
    },
    "template": {
        "baseDir": "./templates",
        "dest": "./publish/templates",
        "cdnPrefix":"http://3glogo.gtimg.com/o2ov1/",
        "templates": {
            "item":["item-detail.html"],
            "deal":["dealConfirm.html"],
            "base":["script.shtml"]
        }
    },
    "server":{
        "port":3344,
        "liveReload": true
    },
    "watch":{
        "ignore":[],
        "ftp": true,
        "dotCompile": true
    },
    "ftp":{
        "ip":"",
        "port":"",
        "username":"",
        "password":"",
        "mapping":{}
    },
    "svn":{

    },
    "css": {

    }
}