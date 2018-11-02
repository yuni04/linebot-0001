var jsload = function() {
    $this = this;

    $this.linebot = require('linebot');
    $this.express = require('express');
    $this.request = require("request"); //抓取整個網頁的程式碼。
    $this.cheerio = require("cheerio"); //後端的 jQuery
    $this.fs = require('fs');
    $this.path = require('path');
    $this.later = require('later');
    $this.Log = require('../_libs/Log.js');

    //載入JS檔
    $this.global = require('./global.js');
    $this.fsFile = require('./fsFile.js');
    $this.schedule = require('./schedule.js');
    $this.main = require('../../main.js');
    require('../../node_color.js');


}
module.exports = new jsload();
