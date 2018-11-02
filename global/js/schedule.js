var linebot = require('linebot');
var later = require('later'); //定時 排程

//載入JS檔
var fsFileJs = require('../js/fsFile.js');
var mainJS = require('../../main.js');

var bot;
var userIDArray = [];

var schedule = function() {
    var goodNight = function() {
        var composite = [
            { h: [23], m: [00] } //设置每天执行
        ];
        var exception = [
            { dw: [6, 0] } //六日不執行
        ];
        var sched = {
            schedules: composite,
            exceptions: exception
        };

        later.date.localTime(); //设置本地时区

        var t = later.setInterval(function() {
            for (var i = 0; i < userIDArray.length; i++) {
                bot.push(userIDArray[i], '又到了說再見的時刻\uDBC0\uDC96讓我們期待明早的相見(scissors)我們夢裡見，晚安囉\uDBC0\uDC9C');
            }
        }, sched);
    }

    var offWork = function() {
        var composite = [
            { h: [18], m: [00] } //每天晚上6點執行
        ];
        var exception = [
            { dw: [6, 0] } //六日不執行
        ];
        var sched = {
            schedules: composite,
            exceptions: exception
        };
        later.date.localTime(); //设置本地时区

        var t = later.setInterval(function() {
            for (var i = 0; i < userIDArray.length; i++) {
                bot.push(userIDArray[i], '嗨\uDBC0\uDC8F 已經到了 下班時間囉\uDBC0\uDC33快收拾書包回家去 GO \uDBC0\uDC49');
            }
        }, sched);
    }

    var reptileFun = function(){
    	var composite = [
            // { m: [00,10,20,30,40,50] } //设置每天执行
            { m: [00] } //设置每天执行
        ];
        var sched = {
            schedules: composite
        };

        later.date.localTime(); //设置本地时区

        var t = later.setInterval(function() {
            mainJS.reptileFun();
        }, sched);
    }

    var userIDList = function(type, data) {
        if (data.code == 100) {
            for (var key in data.data) {
                for (var key2 in data.data[key]) {
                    userIDArray.push(key2);
                }
            }
        }

        switch (type) {
            case 'start':
                offWork();
                goodNight();
                reptileFun();
                break;
        }
    }

    var init = function() {
        //載入line連線資訊
        var tmp = fsFileJs.catchFile('../../profile/config.json');
        tmp = JSON.parse(tmp);
        bot = linebot(tmp);

        //取UserID
        fsFileJs.userDir('start', userIDList);
    }

    init();
}
module.exports = new schedule();
