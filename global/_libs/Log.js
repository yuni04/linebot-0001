
	var Log_fun = function(){
		var fs = require('fs');
		//var mod_path="/usr/lib/node_modules/";
		//var archiver = require(mod_path+'archiver');
		var $this = this;
		var LogPaths = '';
        var prefix;
		Date.prototype.Format = function (fmt) {
		    var o = {
		        "M+": this.getMonth() + 1,
		        "d+": this.getDate(),
		        "H+": this.getHours(),
		        "m+": this.getMinutes(),
		        "s+": this.getSeconds(),
		        "q+": Math.floor((this.getMonth() + 3) / 3),
		        "S": this.getMilliseconds()
		    };
		    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
		    for (var k in o)
		    if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
		    return fmt;
		}
		var SetTime = function(evt,obj){
			var str = '';
			for(var i in obj['time']){
				var timer = obj['time'][i];
				switch(i){
					case "h":{
					 evt.hour = timer;
					 evt.minute = 0;
					 evt.second = 0;
					 str+= timer+" 小時";
					}break;
					case "i":{
						var forI = Math.floor(60 / timer);
						var tmp = [];
						for(var num=1;num <= forI;num++ ){
							tmp.push(num*timer);
						}
						evt.minute = tmp;
						evt.second = 0;
						str+= timer+" 分鐘";
					}break;
					case "s":{
						var forI = Math.floor(60 / timer);
						var tmp = [];
						for(var num=1;num <= forI;num++ ){
							tmp.push(num*timer);
						}
						evt.second = tmp;
						str+= timer+" 分鐘";
					}break;
				}
			}
			return str;
		}
		var LogsEvt = function(type,msg){
			switch(type){
				case "ChkDist":{
					var dist = LogPaths+"/log";
					fs.exists(dist,function(err){
						if(!err){
							fs.mkdirSync(dist,0777);
						}
					});
				}break;
				case "AddLog":{
					var dist = LogPaths+"/log/";
					var Day = new Date().Format("yyyy-MM-dd");
					var fName = prefix + Day+".txt";
					fs.exists(dist+fName,function(err){
						var LogTime = new Date().Format("yyyy-MM-dd HH:mm:ss");
						var AddMsg = "["+LogTime+"] "+msg+"\r\n";
						fs.appendFile(dist+fName,AddMsg,function(err){

						})
					});
				}break;
				case "Backup":{
					var dir = LogPaths+"/log";
					var ToDay = new Date().Format("yyyy-MM-dd");

					fs.readdir(dir,function(err,file){
						var Arr = {};
						if(file){
							if(file.length !=0){
								file.forEach(function(fil){
									 var tmpName = fil.split(".txt")[0];

									 var fileDay = new Date(tmpName);
									 var NowDay = new Date(ToDay);
									 if((NowDay.getMonth()+1 ) - (fileDay.getMonth()+1) == 1){
									 	var zipName = fileDay.getFullYear()+'-'+(fileDay.getMonth()+1);
									 	 if(Arr.hasOwnProperty(zipName)){
									 	   Arr[zipName].push(fil);
									 	 }else{
									 	 	 Arr[zipName] = [];
									 	 	 Arr[zipName].push(fil);
									 	 }
									 }
								});
							}
						}


						var archive = archiver.create('zip', {});

						for(var i in Arr){
							var output = fs.createWriteStream(LogPaths + '/log/'+i+'.zip');

							archive.on('error', function(err){
							    throw err;
							});
							output.on('close', function() {
							    console.log(archive.pointer() + ' total bytes');
							    console.log('archiver has been finalized and the output file descriptor has closed.');
							});
							archive.pipe(output);

							var data = Arr[i];
							if(data.length !=0){
								data.forEach(function(fName){
									var path = LogPaths + '/log/'+fName;
									archive.append(fs.createReadStream(path),{name:fName});

									fs.unlink(path,function(err){
										if (err) {
									      return console.error(err);
									  }
									   console.log("file del");
									});

								})
							}
						}
						archive.finalize();
					});
				}break;
			}
		}
		//paths = 路徑 ,msg = log訊息
		$this.SetLog = function(paths,msg, filePrefix){
            prefix = (filePrefix == undefined ? '' : filePrefix);
			LogPaths = paths;
			LogsEvt("ChkDist");
			LogsEvt("AddLog",msg);
			//LogsEvt("Backup");
		}
	}
	module.exports = new Log_fun();