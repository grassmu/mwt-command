module.exports = {
    "baseDir": "../modules",
    "ignoreDir": ["seeds"],
    "compileDir": "../publish/scripts",
    "tempDir": "../.build",
    "clean": true,
    "copy": ["seeds"],
    "uglifyOption": {},
    "templateBase": "../templates",
    "templateDir": "../publish/templates",
    "templates": {
        "item": {
            "mainFiles": ["item-detail.html"]
        },
        "deal": {
            "mainFiles": ["main.html"]
        }
    }
}