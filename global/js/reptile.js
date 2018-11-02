var request = require("request"); //抓取整個網頁的程式碼。
var cheerio = require("cheerio"); //後端的 jQuery

var reptile = function() {
    var $this = this;

    $this.getRate = function(dataObj, callback) {
        var data = new Object();
        try {
            request({
                url: "http://rate.bot.com.tw/Pages/Static/UIP003.zh-TW.htm",
                method: "GET",
                responseType: 'buffer'
            }, function(error, response, body) {
                try {
                    if (error || !body) {
                        return;
                    } else {
                        var $ = cheerio.load(body);
                        var currency = $(".hidden-phone.print_show");
                        var target = $(".rate-content-sight.text-right.print_hide");

                        for (var i = 0; i < currency.length; i++) {
                            var a = $(currency[i]).html();
                            var b = a.split('(')[1];
                            var c = b.split(')')[0];
                            if (data[c] == undefined)
                                data[c] = new Object();

                            var dataTable = $($(".hidden-phone.print_show")[i]).parents('tr').find('[data-table]');
                            var buyin = $(currency[i]).parents('tr').find('[data-table="本行即期買入"][data-hide="phone"]').html();
                            var selfout = $(currency[i]).parents('tr').find('[data-table="本行即期賣出"][data-hide="phone"]').html();

                            data[c]["本行即期買入"] = buyin;
                            data[c]["本行即期賣出"] = selfout;
                        }

                        // if (data["JPY"]["本行即期賣出"] < 0.27) {
                        //     for (var i = 0; i < userIDArray.length; i++) {
                        //         bot.push(userIDArray[i], '現在日幣 ' + data["JPY"]["本行即期賣出"] + '，該買啦！');
                        //     }
                        // }

                        if (callback && typeof callback == "function") {
                            var res = callback(dataObj, data);
                            if (res === false) return false;
                        }
                    }
                } catch (err) {
                    console.error(err);
                }
            });
        } catch (err) {
            console.error(err);
        }
    }

    $this.getAir = function(dataObj, callback) {
        var data = new Object();
        try {
            request({
                url: "http://opendata2.epa.gov.tw/AQX.json",
                method: "GET",
                responseType: 'buffer'
            }, function(error, response, body) {
                try {
                    if (error || !body) {
                        return;
                    } else {
                        var body = JSON.parse(body);

                        body.forEach(function(e, i) {
                            if (data[e["County"]] == undefined)
                                data[e["County"]] = new Array();

                            if (data[e["County"]][e["SiteName"]] == undefined)
                                data[e["County"]][e["SiteName"]] = new Object();

                            data[e["County"]][e["SiteName"]]["PM2.5"] = e["PM2.5"];
                            data[e["County"]][e["SiteName"]]["Status"] = e["Status"];
                        });
                    }
                    if (callback && typeof callback == "function") {
                        var res = callback(dataObj, data);
                        if (res === false) return false;
                    }

                } catch (err) {
                    console.error(err);
                }
            });
        } catch (err) {
            console.error(err);
        }
    }

    $this.getConstellation = function() {
        var data = new Object();
        try {
            request({
                url: "http://astro.click108.com.tw/daily_6.php?iAstro=6",
                method: "GET",
                responseType: 'buffer'
            }, function(error, response, body) {
                try {
                    if (error || !body) {
                        return;
                    } else {
                    	var $ = cheerio.load(body);
                        var todayDate = $('.INDEX form#selectiastro select option[selected="selected"]').val();
                        var lucky = $('.INDEX .TODAY_LUCKY div.LUCKY');
                        if(data["天秤座"]==undefined)
                        	data["天秤座"] = new Object();

                        data["天秤座"]["幸運號碼"] = $(lucky[0]).find('h4').text();
                        data["天秤座"]["幸運顏色"] = $(lucky[1]).find('h4').text();
                        data["天秤座"]["幸運方位"] = $(lucky[2]).find('h4').text();
                        data["天秤座"]["幸運時段"] = $(lucky[3]).find('h4').text();
                        data["天秤座"]["幸運搭擋"] = $(lucky[4]).find('h4').text();

                        console.error(data);
                        // if (callback && typeof callback == "function") {
                        //     var res = callback(dataObj, data);
                        //     if (res === false) return false;
                        // }
                    }
                } catch (err) {
                    console.error(err);
                }
            });
        } catch (err) {
            console.error(err);
        }
    }

    $this.carouSel = function(type, data, callback) {
        var template = {
            "type": "template",
            "altText": "this is a carousel template",
            "template": {
                "type": "carousel",
                "columns": [],
                "imageAspectRatio": "rectangle",
                "imageSize": "cover"
            }
        };
        var dataObj = type.split('/')[0];
        var city = type.split('/')[1];

        var ObjLength = 0;
        ObjLength = Object.keys(data).length;
        //因為選單一頁3個，而每一頁的數目要一樣，因此要補滿
        ObjLength = ObjLength + (3 - ObjLength % 3);

        for (var i = 0; i < ObjLength; i++) {
            var key;
            key = Object.keys(data)[i];

            if (key == undefined)
                key = '　';

            var columnObj = {
                "title": "請選擇",
                "text": "select",
                "actions": new Array()
            };

            var columnsSeat = Math.floor(i / 3);
            switch (dataObj) {
                case 'airObj':
                    var actionObjData = "cityPM/" + key;
                    break;
                case 'cityPM':
                    var actionObjData = city + "/" + key
                    break;
                default:
                    var actionObjData = key;
                    break;
            }
            var actionObj = {
                "type": "postback",
                "label": key,
                "data": actionObjData
            };

            if (template.template.columns[columnsSeat] == undefined)
                template.template.columns.push(columnObj);

            template.template.columns[columnsSeat].actions.push(actionObj);
        }

        if (callback && typeof callback == "function") {
            var res = callback(dataObj + "Temp", template);
            if (res === false) return false;
        }
    }
}
module.exports = new reptile();
