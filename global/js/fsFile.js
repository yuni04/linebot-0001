var path = require('path');	//處理文件路徑
var fs = require('fs');		//載入node.js的檔案系統模組，用來讀取檔案的內容。

//載入JS檔
var Log = require('../_libs/Log.js');
var globalJs = require('../js/global.js');

var fsFile = function() {
    var $this = this;
    var retrunData = new Object();

    $this.appendFile = function(filePath = 'profile/', appendData = { "dataList": {} }) {
        // var filePath = filePath != undefined ? filePath : 'profile/';
        // var appendData = appendData == null || appendData == undefined ? { "dataList": {} } : appendData;
        // fs.appendFileSync(file_path, appendData); // 使用同步方式，新增內容至檔案的最後

        var today = globalJs.getTime("today");
        var fileName = today + ".json";
        var file_path = path.resolve(__dirname, "../../" + filePath + fileName)
        var allData = $this.userDir('catchUserID')["data"];
        var appendUserID = Object.keys(appendData["dataList"])[0]; //新增的ID
        var userIDExist = false; //檢查此新增的ID是不是已經存在 預設為 false

        for (var key in allData) {
            if (allData[key][appendUserID] != undefined) {
                userIDExist = true;
                break;
            }
        }

        //如果當天檔案 存在
        if (fs.existsSync(file_path)) {
            //如果資料 存在
            if (userIDExist) {
                //不需要動作
                console.warn("檔案 存在 並且 資料 也存在");
                //如果資料 不存在	
            } else {
                console.error("檔案 存在 但是 資料 不存在");
                var data = { "dataList": {} };
                assignData = Object.assign(allData[today], appendData["dataList"]);
                data["dataList"] = assignData;

                fs.writeFileSync(file_path, JSON.stringify(data), function(err) {
                    if (err) throw err;
                    console.log('資料新增成功　' + today + "　" + appendUserID);
                    Log.SetLog(__dirname, '資料新增成功　' + today + "　" + appendUserID);
                });
            }
            //如果當天檔案 不存在
        } else {
            //如果資料 存在
            if (userIDExist) {
                //不需要動作，已經新增過檔案
                console.warn("檔案 不存在 但是 資料 存在");
                //如果資料 不存在	
            } else {
                console.error("檔案 不存在 並且 資料 也不存在");
                fs.writeFileSync(file_path, JSON.stringify(appendData), function(err) {
                    if (err) throw err;
                    console.log('資料新增成功　' + today + "　" + appendUserID);
                    Log.SetLog(__dirname, '資料新增成功　' + today + "　" + appendUserID);
                });
            }
        }
    }

    $this.catchFile = function(filePath) {
        var logininfo = path.resolve(__dirname, filePath);
        var tmp = fs.readFileSync(logininfo, 'utf-8');
        return tmp;
    }

    //抓取 所有目錄的資料
    var readdir = function(type, files) {
        switch (type) {
            case 'userList':
                var sendData = new Object();
                for (var i = 0; i < files.length; i++) {
                    var logininfo = path.resolve(__dirname, '../../profile/userList/' + files[i]);
                    var tmp = fs.readFileSync(logininfo, 'utf-8');
                    tmp = JSON.parse(tmp);
                    var keyName = files[i].split('.json')[0];
                    sendData[keyName] = tmp["dataList"];
                }

                return sendData;
                break;
        }
    }

    $this.userDir = function(type, callback) {
        //讀取所有目錄
        fs.readdir('profile/userList/', function(err, files) {
            if (err) {
                console.log(err);
                return;
            }
            retrunData["code"] = 100;
            retrunData["data"] = readdir('userList', files);
        });

        if (type == "catchUserID") {
            return retrunData;
        } else {
            if (callback && typeof callback == "function") {
                setTimeout(function() {
                    var res = callback(type, retrunData);
                    if (res === false) return false;
                }, 1000 * 3);
            }
        }
    }
}
module.exports = new fsFile();
