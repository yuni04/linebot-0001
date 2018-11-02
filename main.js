/**
主要程式main.js
load
fsFile.js	檔案處理 抓取檔案
global.js	共用程式 ex.時間轉換
scedule.js  排程專用
reptile.js 	爬蟲專用
*/
var linebot = require('linebot'); //load linebot npm
var express = require('express'); //Web 開發框架
//載入JS檔
require('./node_color.js');
var Log = require('./global/_libs/Log.js');
var globalJs = require('./global/js/global.js');
var fsFileJs = require('./global/js/fsFile.js');
var schedule = require('./global/js/schedule.js');
var reptile = require('./global/js/reptile.js');

var bot;
var airObj = new Object();
var rateObj = new Object();
var consObj = new Object();
var userList = new Object();
var rateTemplate = new Object();
var pmTemplate = new Object();
var pm2Template = new Object();
var lineTemplate = {
    type: 'template',
    altText: 'this is a confirm template',
    template: {
        type: 'buttons',
        text: '請選擇您要查詢的資訊',
        actions: [{
            type: 'postback',
            label: '匯率',
            data: 'rate'
        }, {
            type: 'postback',
            label: 'PM2.5',
            data: 'PM2.5'
        }]
    }
};
/**
text：純文字。
image：圖片。
video：影片。
audio：聲音。
location：地點。
sticker：表情符號、貼圖。
*/

var $this = this;
var lineBotApi = function() {
    bot.on('follow', function(event) {
        try {
            switch (event.type) {
                case 'follow':
                    var userId = event.source.userId;
                    var today = globalJs.getTime("today");
                    //Write
                    if (userList[today] == undefined)
                        userList[today] = new Object();
                    if (userList[today]["dataList"] == undefined)
                        userList[today]["dataList"] = new Object();
                    if (userList[today]["dataList"][userId] == undefined)
                        userList[today]["dataList"][userId] = new Object();

                    userList[today]["dataList"][userId]["addTime"] = globalJs.getTime();

                    fsFileJs.appendFile("profile/userList/", userList[today]);
                    ///bug 需要將心增的 userid加入到全域變數 userList裡面 <---在檢查 不確定 已經有做這項目2018/02/09
                    break;
                default:
                    console.info(event);
                    break;
            }
        } catch (err) {
            console.error(err);
        }
    });

    //LineBot處理使用者按下選單的函式
    bot.on('postback', function(event) {
        var replyMsg = processText(event.postback.data);

        event.reply(replyMsg).then(function(data) {
            // console.log(replyMsg);
        }).catch(function(error) {
            console.log('error');
        });
    });

    bot.on('message', function(event) {
        try {
            var replyMsg = '';
            switch (event.message.type) {
                case 'text':
                    replyMsg = processText(event.message.text);
                    break;
                case 'sticker':
                    console.log('sticker');
                    break;
                case 'image':
                    replyMsg = '怎麼了?!';
                    break;
            }

            event.reply(replyMsg).then(function(data) {
                // console.log(replyMsg);
            }).catch(function(error) {
                console.log('error');
            });
        } catch (err) {
            console.error(err);
        }
    });
}

var processText = function(data) {
    var myResult = data.toUpperCase();
    var type = myResult.split('/')[0];
    var type2 = myResult.split('/')[1];

    switch (type) {
        case 'PM2.5':
            myResult = pmTemplate;
            break;
        case 'RATE':
            myResult = rateTemplate;
            break;
        case 'HELP':
            myResult = lineTemplate;
            break;
        case 'CITYPM':
            reptile.carouSel(data, airObj[type2], dataSet);
            myResult = pm2Template;
            break;
        default:
            if (rateObj[data] != undefined) {
                myResult = data + "\uDBC0\uDC2D \n本行即期買入" + rateObj[data]["本行即期買入"] + "\n" + "本行即期賣出" + rateObj[data]["本行即期賣出"];
            } else if (airObj[type] != undefined) {
                if (airObj[type][type2] != undefined) {
                    myResult = type2 + "\uDBC0\uDC97 \nPM2.5：" + airObj[type][type2]["PM2.5"] + "\n狀態：" + airObj[type][type2]["Status"];
                }
            } else {
                myResult = '\uDBC0\uDC92抱歉，我不懂這句話的意思！';
            }
            break;
    }
    return myResult;
}

var dataSet = function(type, data) {
    switch (type) {
        case 'rateObj':
            rateObj = data;
            reptile.carouSel(type, data, dataSet); //將資料放置此function做line選單
            break;
        case 'airObj':
            airObj = data;
            reptile.carouSel(type, data, dataSet); //將資料放置此function做line選單
            break;
        case 'rateObjTemp':
            rateTemplate = data;
            break;
        case 'airObjTemp':
            pmTemplate = data;
            break;
        case 'cityPMTemp':
            pm2Template = data;
            break;
    }
}

var loginInfoData = function(type, data) {
    try {
        if (data.code == 100) {
            if (userList["dataList"] == undefined)
                userList["dataList"] = new Object();

            userList["dataList"] = data.data;
        }

        switch (type) {
            case 'start':
                //伺服器連線
                expressContent();
                $this.reptileFun();
                break;
        }
    } catch (err) {
        console.error(err);
    }
}

$this.reptileFun = function() {
    //載入匯率
    reptile.getRate("rateObj", dataSet);
    //載入 空氣汙染指數
    reptile.getAir("airObj", dataSet);
    //載入 星座
    // reptile.getConstellation("consObj", dataSet);
}

var expressContent = function() {
    const app = express();
    //驗證數位簽章並解析JSON資料
    const linebotParser = bot.parser();

    //處理line訊息伺服器的請求
    app.post('/linewebhook', linebotParser);

    //因為 express 預設走 port 3000，而 heroku 上預設卻不是，要透過下列程式轉換
    const server = app.listen(process.env.PORT || 3000, function() {
        const port = server.address().port;
        console.log("App now running on port", port);
        // Log.SetLog(__dirname, ".4.4App now running on port", port);

        //step 4 連線成功，開始執行API
        lineBotApi();
    });
}

var init = function() {
    Log.SetLog(__dirname, '開始執行');

    //載入line連線資訊
    let tmp = fsFileJs.catchFile('../../profile/config.json');
    tmp = JSON.parse(tmp);
    bot = linebot(tmp);

    //載入 所有 使用者ID
    fsFileJs.userDir('start', loginInfoData);
}

init();
