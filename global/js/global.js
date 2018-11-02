var global = function() {
    var $this = this;

    $this.getTime = function(type) {
    	/**
		type	--today	time	null
		return	--日期	時間		日期+時間
    	*/
        var nowDate = new Date();

        var month = (nowDate.getMonth() + 1);
        var day = nowDate.getDate();
        if (month < 10)
            month = "0" + month;
        if (day < 10)
            day = "0" + day;
        var today = nowDate.getFullYear() + '-' + month + '-' + day;
        var minutes = nowDate.getMinutes();
        if (minutes < 10)
            minutes = "0" + minutes;
        var Seconds = nowDate.getSeconds();
        if (Seconds < 10)
            Seconds = "0" + Seconds;
        var time = nowDate.getHours() + ':' + minutes + ':' + Seconds;

        switch (type) {
            case 'today':
                return today;
                break;
            case 'time':
                return time;
                break;
            default:
                return today + " " + time;
                break;
        }
    }
}
module.exports = new global();
