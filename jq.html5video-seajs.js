define(function(require, exports, module) {
	//视频打节点
	var videoPoint = function(ops) {
		return new videoPoint.fn.init(ops);
	};
	videoPoint.getRandomColor = function() {
		return '#' +
			(function(color) {
				return (color += '0123456789abcdef' [Math.floor(Math.random() * 16)]) && (color.length == 6) ? color : arguments.callee(color);
			})('');
	};
	videoPoint.setPoint = function(elem, parent, type) {
		var self = this;
		if (type == "end"){
			this.videobox.pause();
		}else if (type == "start"){
			this.videobox.play();
		}
		var time = this.videobox.getVideoTime();
		var index = jQuery(elem).parent().attr("id").replace("editpoint_control_", "");
		var item = jQuery("#pointline_" + index),
			item_tip = jQuery(".point_tip", item);
		if (item.length == 0) {
			item = jQuery('<div></div>').addClass("pointline").attr("id", "pointline_" + index);
			//item_tip = jQuery('<div class="point_tip" style="display:none"><span class="pointtip_num"></span><span class="pointtip_text"></span><div class="video_slider_tip_downarrow"></div></div>');
			//item.append(item_tip);
			this.canvas.append(item);
			item_tip.find(".pointtip_text").html("00:00");
			item_tip.find(".pointtip_num").html(index);
			item.click(function() {
				parent.parent().find(".editpoint_item").hide();
				parent.show();
				var val = parent.data("start");
				self.videobox.video.currentTime = videoplayer.toSeconds(val);
				var start = videoPoint.getOffset(self, val);
				self.canvas.parent().animate({
					scrollLeft: start - jQuery(self.pointParent).width() / 2 + "px"
				});
			});
			/*.hover(function() {
				var item_tipa = jQuery(this).find(".point_tip");
				var left = item_tipa.width() > jQuery(this).width() ? item_tipa.width() / 2 - jQuery(this).width() / 2 : jQuery(this).width() / 2;
				item_tipa.show().css({
					left: "-" + (left + 3) + "px"
				});
				jQuery(this).parent().find('.pointline').css({
					zIndex: 1
				});
				jQuery(this).css({
					zIndex: 2
				});
			}, function() {
				jQuery(this).find(".point_tip").hide();
			});*/
		}
		var val = videoPoint.getOffset(this, time);
		var width = "3px";
		if (type == "end") {
			var start = videoPoint.getOffset(this, parent.data('start'));
			val = val - start;
			item_tip.find('.pointtip_text').html(parent.data('start') + "-" + time + "(" + videoPoint.getTime(videoPoint.toSeconds(time) - videoPoint.toSeconds(parent.data('start')), this.videobox.video.duration) + ")");
			width = val;
			this.canvas.parent().animate({
				scrollLeft: start - jQuery(self.pointParent).width() / 2 + "px"
			});
		}
		if (type == "start") {
			var startx = 0;
			if (parent.data('end')) {
				startx = videoPoint.getOffset(this, parent.data('end'));
			}
			width = startx == 0 ? width : val > startx ? val - startx : startx - val;
			this.canvas.parent().animate({
				scrollLeft: val - jQuery(self.pointParent).width() / 2 + "px"
			});

		}
		item.css(type == "start" ? {
			left: val,
			height: this.canvas.height(),
			width: width,
			zIndex: 1,
			background: videoPoint.getRandomColor()
		} : {
			width: val,
		});
		return {
			start: time,
			val: val
		};
	};
	videoPoint.getTime = function(a, c) {
		c = c || a;
		var d = Math.floor(a % 60),
			e = Math.floor(a / 60 % 60),
			g = Math.floor(a / 3600),
			h = Math.floor(c / 60 % 60),
			k = Math.floor(c / 3600);
		if (isNaN(a) || Infinity === a) g = e = d = "-";
		g = 0 < g || 0 < k ? g + ":" : "00:";
		var f = g + (((g || 10 <= h) && 10 > e ? "0" + e : e) + ":") + (10 > d ? "0" + d : d);
		f = /(-\S)/.test(f) ? f.replace(/(-\S)/gi, "0") : f;
		return f;
	};
	videoPoint.toSeconds = function(a) {
		a = a.split(':');
		var b = 0,
			i,
			len = a.length;
		for (i = 0; i < len; i++) {
			var num = a[i];
			if (len == 3) {
				if (i == 0) {
					b += parseInt(num) * 60 * 60;
				} else if (i == 1) {
					b += parseInt(num) * 60;
				} else {
					b += parseInt(num);
				}
			} else if (len == 2) {
				if (i == 0) {
					b += parseInt(num) * 60;
				} else if (i == 1) {
					b += parseInt(num);
				}
			} else {
				b += parseInt(num);
			}
		}
		return b;
	};
	videoPoint.getOffset = function(self, time) {
		var vseconds = videoPoint.toSeconds(time);
		var total = self.videobox.video.duration;
		var val = (vseconds / total) * self.canvas.width();
		return val;
	};

	videoPoint.fn = videoPoint.prototype = {
		init: function(ops) {
			this.controlCount = 0;
			this.points = [];
			this.isCreat = false;
			this.createTmpl = '<div class="editpoint_item"><span class="editpoint_num"></span><button class="video_startpoint">开始</button><button class="video_endpoint">结束</button><button class="video_pointsave">保存</button><button class="video_pointcancel">取消</button><span class="pointsbox"><input type="text" class="timea" value="" readonly /><input type="text" value="" class="timeb" readonly /></span></div>';
			var self = this;
			jQuery.each(["createPoint", "startPoint", "endPoint", "savePoint", "cancelPoint", "error"], function(i, name) {
				self["on" + name] = function() {};
			});
			jQuery.extend(this, ops);
			if (!this.debug) {
				if (this.info) jQuery(this.info).hide();
			} else {
				if (this.info) jQuery(this.info).show();
			}
			this.createCanvas();
			this.exec();
			return this;
		},
		createCanvas: function() {
			var canvas = this.canvas = jQuery(this.pointCanvas),
				width = this.videobox.video.width;
			canvas.parent().css({
				width: width
			});
			var i = 0,
				n = 0,
				duration = this.videobox.video.duration,
				len = parseInt(duration),
				elems = jQuery("<div></div>");
			for (i = 1; i < len; i++) {
				var val = videoPoint.getTime(i, parseFloat(duration)),
					valsp = val.split(':'),
					lens = valsp.length;
				if ((lens == 2 && /00/.test(valsp[1])) || (lens == 3 && /00/.test(valsp[2]))) {
					n += 1;
					var isHour = (len == 2 && /00/.test(valsp[1])) || (lens == 3 && /00/.test(valsp[1]) && /00/.test(valsp[2]));
					var elem = jQuery('<div></div>').addClass((isHour ? 'houtline' : 'minline') + ' timeline').attr("data-val", val);
					var timespan = jQuery("<span></span>").html(val).addClass('timespan');
					elems.append(elem);
					elems.append(timespan);
					var left = n * (isHour ? 240 : 240);
					elem.css({
						left: left,
						zIndex: 3
					});
					timespan.css({
						left: left,
						zIndex: 1
					});
				}
				var elem = jQuery('<div></div>').addClass('secline timeline').attr("data-val", val);
				elems.append(elem);
				elem.css({
					left: i * 4,
					zIndex: 3
				});
			}
			var pointCurrentLine = this.pointCurrentLine = jQuery("<div></div>").addClass('point_currentline');
			elems.append(pointCurrentLine);
			canvas.css({
				width: len * 4
			})
			canvas.append(elems);
			/*var k = width / n,
				elems = this.canvasElems = canvas.find('.timeline');
			for (i = 0; i < len; i++) {
				jQuery(elems[i]).css({
					left: i * k,
					zIndex: 3
				});
			}*/
		},
		exec: function() {
			var self = this;
			jQuery(self.createPoint).click(function() {
				if (!self.isCreat) {
					self.isCreat = true;
					jQuery(".editpoint_item").hide();
					var elem = jQuery(self.createTmpl);
					jQuery(self.controlParent).append(elem);
					var pointsbox = elem.find(self.pointCls);
					self.controlCount += 1;
					//elem.find(".editpoint_num").html(self.controlCount);
					elem.attr("id", "editpoint_control_" + self.controlCount);
					jQuery(self.startPoint, elem).click(function() {
						var obj = videoPoint.setPoint.call(self, this, elem, "start");
						//pointsbox.html(pointsbox.html() + " startPoint: " + obj.start);
						pointsbox.find(".timea").val(obj.start);
						elem.data("start", obj.start);
						elem.data("startx", obj.val);
						self.onstartPoint(obj.start, obj.val, "startpoint");
					});
					jQuery(self.endPoint, elem).click(function() {
						var obj = videoPoint.setPoint.call(self, this, elem, "end");
						//pointsbox.html(pointsbox.html() + " endPoint: " + obj.start);
						pointsbox.find(".timeb").val(obj.start);
						elem.data("end", obj.start);
						elem.data("endx", obj.val);
						self.onendPoint(obj.start, obj.val, "endpoint");
					});
					jQuery(self.savePoint, elem).click(function() {
						if (elem.data("start") && elem.data("end")) {
							jQuery(self.info).html(jQuery(self.info).html() + "<br />save!");
							var index = jQuery(this).parent().attr("id").replace("editpoint_control_", "");
							index = parseInt(index) - 1 <= 0 ? 0 : parseInt(index) - 1;
							if (self.points[index]) {
								self.points[index] = [elem.data("start"), elem.data("end")].join('|');
							} else {
								self.points.push([elem.data("start"), elem.data("end")].join('|'));
							}
							jQuery(self.info).html(jQuery(self.info).html() + self.points.join(','));
							self.isCreat = false;
							elem.hide();
							self.onsavePoint(elem.data("start"), elem.data("end"), self.points, "savepoint");
							self.videobox.video.play();
						} else {
							alert("请设置节点开始及结束")
						}
					});
					jQuery(self.cancelPoint, elem).click(function() {
						jQuery(self.info).html(jQuery(self.info).html() + "<br />cancel!");
						var index = jQuery(this).parent().attr("id").replace("editpoint_control_", "");
						jQuery.each(["pointline_"], function(i, name) {
							jQuery("#" + name + index).remove();
						});
						index = parseInt(index) <= 0 ? 0 : parseInt(index) - 1;
						self.points.splice(index, 1);
						jQuery(self.info).html(jQuery(self.info).html() + self.points.join(','));
						jQuery(this).parent().remove();
						self.isCreat = false;
						self.oncancelPoint(self.points, "cancelpoint");
						self.videobox.video.play();
					});
					self.oncreatePoint(elem, "createpoint");
				} else {
					alert("请编辑完节点后再创建！")
					jQuery(self.controlParent).find(".editpoint_item").hide();
					var elem = jQuery("#editpoint_control_" + self.controlCount).show();
					var val = elem.data("start");
					var start = videoPoint.getOffset(self, val);
					self.pointCurrentLine.stop(1, 1).animate({
						left: start + "px"
					});
					self.canvas.parent().animate({
						scrollLeft: start - jQuery(self.pointParent).width() / 2 + "px"
					});
					self.videobox.video.currentTime = videoPoint.toSeconds(val);
				}
			});
		},
		timeupdate: function(data) {
			var self = this;
			var start = videoPoint.getOffset(self, data.currentTime).toFixed(0);
			self.pointCurrentLine.stop(1, 1).animate({
				left: start + "px"
			});
			self.canvas.parent().stop(1, 1).animate({
				scrollLeft: start - jQuery(self.pointParent).width() / 2 + "px"
			});

		}
	};
	videoPoint.fn.init.prototype = videoPoint.fn;

	//视频播放器
	/*var bigTextTrack = [
		'大幕测试滚动', '大幕测试滚动大幕测试滚动大幕测试滚动', '大幕测试滚动大幕测试滚动', '大幕测试滚动', '大幕测试滚动大幕测试滚动', '大幕测试滚动大幕测试滚动大幕测试滚动大幕测试滚动'
	];*/

	var cookie = require("jqcookie");
	//var storage = require("jqlocalstorage");
	jQuery.contextMenu = require("jqcontextmenu");
	var win = window,
		doc = win.document,
		ua = navigator.userAgent.toLowerCase(),
		isie = /(msie) ([\w.]+)/.exec(ua) && /(msie) ([\w.]+)/.exec(ua)[1] == "msie" && /(msie) ([\w.]+)/.exec(ua),
		isopr = /(opr)\/([\w.]+)/.exec(ua),
		p = navigator.platform.toLowerCase(),
		ispc = (p.match(/win|mac|x11|linux/i) != null && !/win|mac|x11|linux/.test(p.match(/win|mac|x11|linux/i)[0])) || !/cros/.test(/(cros) [a-z 0-9]+ ([\d.]+)/.exec(ua)),
		_toString = Object.prototype.toString,
		isFunction = function(v) {
			return (v != null) ? typeof v === "function" && typeof v.call != 'undefined' && _toString.call(v) === '[object Function]' : false;
		},
		ispc = ua.match(/android|mobile/i) ? false : ispc,
		videoplayer = function(options) {
			return new videoplayer.fn.init(options);
		},
		max = 0,
		connectNum = 0,
		connectNumMax = 3,
		playnum = 0,
		isCanplay = false,
		navtype = "",
		autoplay = true,
		infoTimeout = null,
		videoinfoTimeout = null,
		logoTimeout = null,
		info = [],
		dragging = false,
		volume_dragging = false,
		videolen = 0,
		_oldX = 0,
		_oldY = 0,
		dragX = 0,
		slideTimeout = null,
		swhiTimeout = null,
		showTipTimeout = null,
		hideTipTimeout = null,
		videomousemoveTimeout = null,
		videomousemoveTimeoutA = null,
		fullscreenTimeout = null,
		status = "defalut",
		ispaused = false,
		mouseX, mouseY, objX, objY,
		randomNum = 0,
		isArray = Array.isArray || function(obj) {
			return jQuery.type(obj) === "array";
		};

	isie = !isie ? ua.indexOf("trident") > -1 && ua.indexOf("rv") > -1 ? ['', 'msie', '11'] : null : isie;
	var storage;
	try {
		storage = window.localStorage;
	} catch (e) {
		storage = false;
	}

	videoplayer.canpt = ['video/mp4', 'video/ogg', 'video/webm'];
	videoplayer.canHtml5 = (function() {
		return doc.createElement("video").canPlayType;
	})();
	jQuery.extend(videoplayer, {
		fullscreen: function(isFullscreen, callback) {
			if (isFullscreen) {
				if (callback) callback();
				if (this.webkitRequestFullScreen) {
					this.webkitRequestFullScreen();
					navtype = "webkit";
				} else if (this.mozRequestFullScreen) {
					this.mozRequestFullScreen();
					navtype = "moz";
				} else if (this.msRequestFullscreen) {
					this.msRequestFullscreen();
					navtype = "ms"
				} else if (this.requestFullscreen) {
					this.requestFullscreen();
					navtype = "";
				}
			} else {
				if (doc.webkitCancelFullScreen) {
					doc.webkitCancelFullScreen();
				} else if (doc.mozCancelFullScreen) {
					doc.mozCancelFullScreen();
				} else if (doc.msExitFullscreen) {
					doc.msExitFullscreen();
				} else if (doc.exitFullscreen) {
					doc.exitFullscreen();
				}
				if (callback) callback();
			}
		},
		gettype: function(url) {
			var type = /\.(mp4|ogv|webm)/.exec(url) && /\.(mp4|ogv|webm)/.exec(url)[1],
				canpt = videoplayer.canpt;
			var types = {
				mp4: canpt[0],
				ogv: canpt[1],
				webm: canpt[2]
			};
			return types[type] || false;
		},
		getTime: function(a, c) {
			c = c || a;
			var d = Math.floor(a % 60),
				e = Math.floor(a / 60 % 60),
				g = Math.floor(a / 3600),
				h = Math.floor(c / 60 % 60),
				k = Math.floor(c / 3600);
			if (isNaN(a) || Infinity === a) g = e = d = "-";
			g = 0 < g || 0 < k ? g + ":" : "00:";
			var f = g + (((g || 10 <= h) && 10 > e ? "0" + e : e) + ":") + (10 > d ? "0" + d : d);
			f = /(-\S)/.test(f) ? f.replace(/(-\S)/gi, "0") : f;
			return f;
		},
		toSeconds: function(a) {
			a = a.split(':');
			var b = 0,
				i,
				len = a.length;
			for (i = 0; i < len; i++) {
				var num = a[i];
				if (len == 3) {
					if (i == 0) {
						b += parseInt(num) * 60 * 60;
					} else if (i == 1) {
						b += parseInt(num) * 60;
					} else {
						b += parseInt(num);
					}
				} else if (len == 2) {
					if (i == 0) {
						b += parseInt(num) * 60;
					} else if (i == 1) {
						b += parseInt(num);
					}
				} else {
					b += parseInt(num);
				}
			}
			return b;
		},
		toTimeFormat: function(a) {
			a = a.split(':');
			var b;
			if (a.length == 2) {
				a.splice(0, 0, 0);
			}
			if (/,/.test(a[a.length - 1])) {
				var b = (parseInt(a[a.length - 1].replace(',', '')) / 60 / 60).toFixed(0);
				b = b <= 9 ? "0" + b : b;
				a[a.length - 1] = b;
			}
			return new Date(0, 0, 0, a[0], a[1], a[2]);
		},
		getXY: function(video, videobox, menu, e) {
			var mini = 50,
				miniY = video.fullscreened ? mini : jQuery(videobox).offset().top + mini,
				maxY = video.fullscreened ? jQuery(videobox).height() : jQuery(videobox).offset().top + jQuery(videobox).height(),
				miniX = video.fullscreened ? mini : jQuery(videobox).offset().left + mini,
				maxX = video.fullscreened ? jQuery(videobox).width() : jQuery(videobox).offset().left + jQuery(videobox).width();

			var top = e.clientY <= miniY ? 0 : (e.clientY + mini) >= maxY ? e.clientY - menu.height() : e.clientY - mini,
				left = e.clientX <= miniX ? 0 : (e.clientX + menu.width()) >= maxX ? e.clientX - jQuery(videobox).offset().left - menu.width() : e.clientX - jQuery(videobox).offset().left - mini;
			return {
				top: top,
				left: left
			};
		},
		localData: function(name, value, ops) {
			if (value) {
				if (storage) {
					storage.setItem(name, value, ops);
				} else {
					cookie.exec(name, value, ops);
				}
			} else {
				var timeupdate = false;
				if (storage) {
					timeupdate = storage.getItem(name) || false;
				} else {
					timeupdate = cookie.exec(name) || false;
				}
				return timeupdate;
			}
		},
		random: function(mx, mi) { //随机数
			return (typeof mx != "undefined") ? Math.floor(Math.random() * (mx - (mi || 0) + 1) + (mi || 0)) : 0;
		}
	});

	videoplayer.tmpl = '<div class="pullin"></div><div class="loading"><span></span></div><div class="bigTextTrack"></div><div class="centerplay" style="display:none"></div><div id="video_control" class="video_control"><button type="button" name="play" class="playbutton"></button><input type="range" min="0" max="0" step="0" class="video_range" name="playtime" /><span id="video_len" class="video_len">0:00/0:00</span><div class="video_slider"><div class="video_slider_backA"><div class="video_buffer"></div><div class="video_slider_back"></div></div><div class="video_slider_button"><span class="forward"></span><span class="fallback"></span></div><div class="video_slider_tip" style="display:none"><span></span><div class="video_slider_tip_downarrow"></div></div></div><div class="volumebox"><button type="button" name="muted" class="volumebutton"></button><div class="volume_slider"><div class="volume_slider_button"></div><div class="volume_slider_back"><div class="volume_slider_backA"></div></div></div></div><button type="button" name="fullscreen" class="fullscreen"></button></div><div id="video_logo" class="video_logo"><span>Power by</span> <a href="{$url}" target="_blank">{$name}</a></div><div id="video_info" class="video_info"></div>';


	var eventFun = {
		onloadstart: function(callback) {
			eventFun.ontimeinfo.call(this, "连接视频");
			callback({
				status: 'VIDEO_LOADSTART'
			});
		},
		ondurationchange: function(callback, target) {
			videolen = target.duration;
			var max = videoplayer.getTime(target.duration);
			this.playtime.attr("max", target.duration);
			this.timelen.show().html("0:00/" + (max && max != "Infinity" ? max : "..."));
			callback({
				duration: (max && max != "Infinity" ? max : undefined),
				status: 'VIDEO_DURATION_CHANGE'
			});
		},
		onloadedmetadata: function(callback) {
			eventFun.ontimeinfo.call(this, "获取信息");
			callback({
				status: 'VIDEO_LOADEDMETADATA'
			});
		},
		onloadeddata: function(callback) {
			eventFun.ontimeinfo.call(this, "准备缓冲");
			callback({
				status: 'VIDEO_LOADEDDATA'
			});
		},
		onprogress: function(callback, target, e) {
			var self = this;
			if (target.buffered.length > 0) {
				var i = target.buffered.length - 1;
				/*if (target.buffered.end(i) < target.duration) {
					var rate = (target.buffered.end(i) / target.duration) * 100;
					rate = rate.toFixed(0) + "%";
					self.pullinBox.show().css({
						top: self.videobox.height() / 2 - self.pullinBox.height() / 2,
						left: self.videobox.width() / 2 - self.pullinBox.width() / 2,
					}).find("span").html('正在拉取中... ' + rate);
				} else {
					self.pullinBox.hide();
				}*/
				var max = (target.duration.toFixed(1) / 60).toFixed(2);
				var left = (self.video.buffered.start(i).toFixed(1) / 60).toFixed(2) || 0,
					width = (self.video.buffered.end(i).toFixed(1) / 60).toFixed(2) || 0;
				var rate = ((width / max)) * self.videoSlider.width();
				self.videoBuffer.attr("id", "bufferitem_" + i).css({
					"width": rate
				});
				if (rate == self.videoSlider.width()) rate = "100%";
				callback({
					total: max,
					current: width,
					rate: rate,
					status: 'VIDEO_PROGRESS'
				});
			}
		},
		oncanplay: function(callback, target) {
			var self = this;
			if (status == "defalut") {
				if (self.isSkipMovie) {
					var start = self.video.skipMovie;
					if (start) {
						target.currentTime = videoplayer.toSeconds(start[0]);
					} else {
						target.currentTime = 0;
					}
					status = 'continue';
				} else if (self.isrecord) {
					var timeupdate,
						videoid = jQuery(self.video).attr("data-sid");
					timeupdate = videoplayer.localData(videoid + "_timeupdate");
					if (timeupdate && self.video.currentSrc == timeupdate.split(', ')[0]) {
						target.currentTime = timeupdate.split(', ')[1];
						status = 'continue';
					}
				}
			}
			isCanplay = true;
			self.videoControlShow();
			callback({
				status: 'VIDEO_CANPLAY',
				current: target.currentTime
			});
		},
		oncanplaythrough: function(callback, target) {
			if (!this.isSetPoint && !this.editTextTrack && (/play/.test(status) || (this.video.looped && (status == "ended" || target.currentTime == 0)) || status == "defalut" && autoplay)) {
				this.videoCenterplay.hide();
				this.video.play();
			} else {
				if (this.editTextTrack || this.isSetPoint)
					this.videoCenterplay.hide();
				else
					this.videoCenterplay.show();
			}
			callback({
				status: 'VIDEO_CANPLAYTHROUGH'
			});
		},
		onseeking: function(callback) {
			//eventFun.ontimeinfo.call(this, "跳转中...", "seeked");
			callback({
				status: 'VIDEO_SEEKING'
			});
		},
		onseeked: function(callback, target) {
			var self = this;
			eventFun.ontimeinfo.call(self, target.currentTime == 0 ? "等待播放" : '跳转至 ' + videoplayer.getTime(target.currentTime), "seeked");
			callback({
				status: 'VIDEO_SEEKED'
			});
		},
		ontimeupdate: function(callback, target) {
			var self = this;
			var max = videoplayer.getTime(target.duration);
			var time = videoplayer.getTime(target.currentTime, target.duration);
			var end = self.video.skipMovie;
			if (self.isTextTrack && !self.editTextTrack) {
				jQuery.each(self.video.textlist, function(i, value) {
					var vs = videoplayer.toTimeFormat(value.start),
						ve = videoplayer.toTimeFormat(value.end),
						vt = videoplayer.toTimeFormat(time);
					if (vs <= vt && ve >= vt) {
						self.video.textbox.show().caption.html(value.text);
						return false;
					} else {
						self.video.textbox.hide();
					}
				});
			}
			self.videoLoading.find("span").html(time + "/" + (self.isSkipMovie ? end[1] : max && max != "Infinity" ? max : "..."))
			var videoid = jQuery(self.video).attr("data-sid");
			if (self.isrecord) videoplayer.localData(videoid + "_timeupdate", "" + self.video.currentSrc + ", " + target.currentTime + "");
			this.timelen.show().html(time + "/" + (self.isSkipMovie ? end[1] : max && max != "Infinity" ? max : "..."));
			var left = (target.currentTime / target.duration) * self.videoSlider.width(),
				buttonwidth = self.videoSliderButton.width() / 2;
			left = left <= buttonwidth ? left <= 0 ? "-" + buttonwidth : parseFloat(left.toFixed(0)) : left - buttonwidth >= self.videoSlider.width() ? left - buttonwidth : left;
			this.playtime[0].value = target.currentTime;
			self.videoSliderButton.stop(1, 1).animate({
				"left": left
			});
			/*self.videoSliderTip.css({
				"left": left
			}).html(time);*/
			self.videoSliderpro.stop(1, 1).animate({
				"width": left + buttonwidth
			});
			if (self.isSkipMovie) {
				if (time == end[1] || target.currentTime >= videoplayer.toSeconds(end[1])) {
					status = "skip";
					self.video.pause();
				}
			}
			callback({
				totalTime: (max && max != "Infinity" ? max : undefined),
				currentTime: time,
				rate: ((target.currentTime / target.duration) * 100).toFixed(0) + "%",
				status: 'VIDEO_TIMEUPDATE'
			});
		},
		onpause: function(callback) {
			var self = this;
			if (status == "ended") {
				eventFun.ontimeinfo.call(self, "停止播放", "pause");
			} else if (status == "skip") {
				eventFun.ontimeinfo.call(self, "试看结束", "skip");
			} else {
				eventFun.ontimeinfo.call(self, self.isSkipMovie ? "暂停试看" : "暂停播放", "pause");
			}
			var bttdiv = jQuery('.bttDiv');
			bttdiv.stop(1, 1);
			self.playbutton.addClass("playbutton").removeClass('pausebutton');
			self.videoControlHide(function() {
				self.videoCenterplay.show();
			});
			callback({
				status: 'VIDEO_PAUSE'
			});
		},
		onplaying: function(callback) {
			var self = this;
			var end = this.video.skipMovie,
				time = videoplayer.getTime(self.video.currentTime, self.video.duration);
			if (self.isSkipMovie && (time == end[1] || self.video.currentTime >= videoplayer.toSeconds(end[1]))) {
				self.video.currentTime = videoplayer.toSeconds(end[0]);
			} else {
				if (self.isSkipMovie) {
					eventFun.ontimeinfo.call(self, "开始试看", "play");
				} else {
					eventFun.ontimeinfo.call(self, "开始播放", "play");
				}
			}
			self.videoCenterplay.hide();
			self.playbutton.addClass("pausebutton").removeClass('playbutton');
			var bttdiv = jQuery('.bttDiv');
			bttdiv.each(function() {
				var random = videoplayer.random(20, 10) * 1000;
				jQuery(this).animate({
					left: jQuery(this).attr('data-matev')
				}, random);
			});
			if (isCanplay) {
				self.videoControlShow();
			}
			callback({
				status: 'VIDEO_PLAYING'
			});
		},
		onended: function(callback) {
			var self = this;
			self.video.currentTime = 0;
			eventFun.ontimeinfo.call(self, "播放完成", "ended");
			if (status == "ended") {
				self.video.currentTime = 0;
			}
			callback({
				status: 'VIDEO_ENDED'
			});
		},
		onstalled: function(callback) {
			var self = this;
			eventFun.ontimeinfo.call(self, "拉取失败, 正尝试重新拉取");
			callback({
				status: 'VIDEO_STALLED'
			});
		},
		onabort: function(callback) {
			var self = this;
			connectNum += 1;
			if (connectNum < connectNumMax) {
				self.video.load();
			} else {
				eventFun.ontimeinfo.call(self, "您的浏览器已经停止请求视频");
				self.videoLoading.hide();
			}
			callback({
				status: 'VIDEO_ABOUT'
			});
		},
		onsuspend: function(callback) {
			//eventFun.ontimeinfo.call(this, "努力缓冲中...");

			callback({
				status: 'VIDEO_SUSPEND'
			});
		},
		onwaiting: function(callback) {
			callback({
				status: 'VIDEO_WAITING'
			});
		},
		onemptied: function(callback) {
			callback({
				status: 'VIDEO_EMPTIED'
			});
		},
		onerror: function(callback, target, e) {
			var msg = '错误：出现未知错误。';
			if (this.video.error) {
				switch (this.video.error.code) {
					case 1:
						msg = "错误：你停止视频。";
						eventFun.ontimeinfo.call(this, msg);
						break;
					case 2:
						msg = '错误：网络错误-请稍后再试。';
						eventFun.ontimeinfo.call(this, msg);
						break;
					case 3:
						msg = "错误：视频连接断了，请稍候重试。";
						eventFun.ontimeinfo.call(this, msg);
						this.videoCenterplay.show();
						this.video.abort();
						break;
					case 4:
						msg = "错误：对不起，您的浏览器无法播放此视频。"
						eventFun.ontimeinfo.call(this, msg);
						break;
					default:
						eventFun.ontimeinfo.call(this, msg);
						break;
				}
				status = "ended";
				//this.video.pause();
				this.videoLoading.hide();
				callback({
					status: 'VIDEO_ERROR',
					code: this.video.error && this.video.error.code || 0,
					msg: msg
				});
			} else {
				/*var self = this;
				if (typeof doc.fullScreen != "undefined" && doc.fullScreen || typeof doc.mozFullScreen != "undefined" && doc.mozFullScreen || typeof doc.webkitIsFullScreen != "undefined" && doc.webkitIsFullScreen) {
					eventFun.onfullscreenchange.call(this, function(data) {
						self.onfullscreen_event(data);
					});
					return;
				} else if (typeof doc.fullScreen != "undefined" && doc.fullScreen == false || typeof doc.mozFullScreen != "undefined" && doc.mozFullScreen == false || typeof doc.webkitIsFullScreen != "undefined" && doc.webkitIsFullScreen == false) {
					eventFun.onfullscreenchange.call(this, function(data) {
						self.onfullscreen_event(data);
					});
					return;
				}*/
				callback({
					status: 'VIDEO_ERROR'
				});
			}
		},
		ontimeinfo: function(info, type) {
			var self = this;
			status = type || status;
			clearTimeout(videoinfoTimeout);
			clearTimeout(infoTimeout);
			self.videoInfo.stop(1, 1).css({
				opacity: 0
			}).html('');
			videoinfoTimeout = setTimeout(function() {
				self.videoInfo.animate({
					opacity: 1
				}, "fast", function() {
					self.videoInfo.html(info);
				});
				clearTimeout(infoTimeout);
				infoTimeout = setTimeout(function() {
					self.videoInfo.animate({
						opacity: 0
					}, "fast", function() {
						self.videoInfo.html("");
					});
				}, 5000);
			}, 1);
		},
		ontimelogo: function(info) {
			this.videoLogo.slideDown().html(info + '<div class="copyright"><span>Power by</span> <a href="' + this.site + '" target="_blank">' + this.name + '</a></div>');
		},
		onfullscreenchange: function(callback, target, e) {
			var status;
			jQuery(this.video).css({
				width: "100%",
				height: "100%"
			});
			var x = (this.video.currentTime / this.video.duration) * this.videoSlider.width(),
				buttonwidth = this.videoSliderButton.width() / 2;
			x = x <= buttonwidth ? x <= 0 ? "-" + buttonwidth : parseFloat(x.toFixed(0)) : x - buttonwidth >= this.videoSlider.width() ? x - buttonwidth : x;
			this.videoSliderButton.stop(1, 1).css({
				"left": x + "px"
			});
			this.videoSliderpro.stop(1, 1).css({
				"width": (x + buttonwidth) + "px"
			});
			if (doc.fullScreen || doc.mozFullScreen || doc.webkitIsFullScreen || doc.msFullscreenElement) {
				if (screen.width >= 768 && screen.width <= 991)
					this.videobox.addClass('media768');
				else if (screen.width >= 992 && screen.width <= 1199)
					this.videobox.addClass('media992');
				else if (screen.width >= 1200 && screen.width <= 1365)
					this.videobox.addClass('media1200');
				else if (screen.width >= 1366 && screen.width <= 1600)
					this.videobox.addClass('media1366');
				else if (screen.width >= 1601)
					this.videobox.addClass('media1600');
				this.video.fullscreened = true;
				this.fullscreenButton.addClass('nofullscreen').removeClass('fullscreen');
				eventFun.ontimeinfo.call(this, "进入全屏(按ESC键退出全屏)");
				status = 'VIDEO_FULLSCREENED';
			} else if (this.video.fullscreened == true && (!doc.fullScreen || !doc.mozFullScreen || !doc.webkitIsFullScreen || !doc.msFullscreenElement)) {
				jQuery(this.videobox).each(function() {
					var val = jQuery(this).data("size");
					if (val && val.dfwidth && val.dfheight) {
						jQuery(this).css({
							width: val.dfwidth,
							height: val.dfheight
						});
					}
				});
				this.videobox.removeClass('media768 media992 media1200 media1366 media1600');
				this.video.fullscreened = false;
				this.fullscreenButton.addClass('fullscreen').removeClass('nofullscreen');
				eventFun.ontimeinfo.call(this, "退出全屏");
				status = 'VIDEO_EXITFULLSCREEN';
			}
			callback({
				status: status
			});
		}
	};

	videoplayer.fn = videoplayer.prototype = {
		constructor: videoplayer,
		name: "HTML5VIDEO",
		site: "https://github.com/ereddate/html5video",
		ver: "0.1.3",
		init: function(ops) {
			var self = this;
			jQuery.each(["error", "canplay", "loadedmetadata", "timeupdate", "playing", "pause", "volumechange", "loadstart", "ended", "stalled", "waiting", "progress", "loadeddata", "durationchange", "suspend", "seeking", "seeked", "canplaythrough", "abort", 'fullscreenchange', 'muted', 'screenin', 'screenout', 'emptied'], function(i, name) {
				self['on' + name + '_event'] = function(data, e) {};
			});
			jQuery.each(["forward", "fallback", "forward_fast", "fallback_fast"], function(i, name) {
				self[name] = function(max, min) {
					max = max || 2.5;
					min = min || 0.5;
					if (self.video) {
						var crt = self.video.currentTime,
							dut = self.video.duration;
						switch (name) {
							case 'forward':
								crt = crt + min >= dut ? dut : crt + min;
								break;
							case 'fallback':
								crt = crt - min <= 0 ? 0 : crt - min;
								break;
							case 'forward_fast':
								crt = crt + max >= dut ? dut : crt + max;
								break;
							case 'fallback_fast':
								crt = crt - max <= 0 ? 0 : crt - max;
								break;
						}
						self.video.currentTime = crt;
					}
					return self;
				};
			});

			var videobox = self.videobox = jQuery("#video"),
				canpt_end = [],
				options = {
					preload: "auto",
					poster: "",
					loop: false,
					defaultMuted: false,
					defaultPlaybackRate: 1,
					width: "100%",
					height: "100%",
					id: "video_html5_api",
					isrightmenu: true, //是否开启右键菜单
					isrecord: true, //是否开启进度记录
					isSetPoint: false, //是否开启打点
					points: [],
					isTextTrack: false, //是否开启字幕
					isSkipMovie: false, //是否开启影片试看
					editTextTrack: false, //是否编辑字幕
					isFullscreen: true, //是否开启全屏
					isControl: true //是否显示控制栏
				},
				video = self.video = doc.getElementById(options.id),
				videoCanPlay = function(url, video) {
					var videoIsCanPlay = false,
						urls = [];
					jQuery.each(url, function(i, file) {
						videoIsCanPlay = video.canPlayType(videoplayer.gettype(file));
						urls.push(file);
						if (videoIsCanPlay) return false;
					});
					ops.url = urls;
					return videoIsCanPlay;
				};
			if (typeof ops.url == "function") {
				ops.url(function(data) {
					ops.url = data;
					videoCanPlay = videoCanPlay(ops.url, video);
				});
			} else {
				if (typeof ops.url == "string") ops.url = ops.url.split(' ');
				videoCanPlay = videoCanPlay(ops.url, video);
			}
			if (videoplayer.canHtml5) {
				if (videoCanPlay && !/function/.test(typeof videoCanPlay) && (videoCanPlay != '' || isArray(videoCanPlay))) {
					jQuery(self.video).attr("data-sid", "video_" + this.name);
					jQuery.extend(self, jQuery.extend(options, ops));

					var onvideo_mousedown = function(e) {
							var evt = e.target;
							e.preventDefault();
							if (jQuery(evt).parents("#video")) {
								switch (e.button) {
									case 0:
										break;
									case 1:
										break;
									case 2:
										if (self.isControl && self.isrightmenu) {
											var contextMenuConfig = [{
												type: "text",
												title: "版本 " + self.ver
											}, {
												type: "line"
											}, {
												type: "button",
												title: video.paused ? "播放视频" : "暂停播放",
												callback: function(video, el, evt) {
													if (video.paused) {
														video.play();
														el.html("暂停播放");
													} else {
														video.pause();
														el.html("播放视频");
													}
												}
											}, {
												type: "button",
												title: video.looped ? "停止循环" : "循环播放",
												callback: function(video, el, evt) {
													if (video.looped) {
														video.loop = false;
														el.html("循环播放");
														video.looped = false;
													} else {
														video.loop = true;
														el.html("停止循环");
														video.looped = true;
													}
												}
											}];

											if (self.isFullscreen) {
												contextMenuConfig.push({
													type: "button",
													title: video.fullscreened ? "取消全屏" : "开启全屏",
													callback: function(video, el, evt) {
														if (video.fullscreened) {
															onfullscreen_click();
															el.html("开启全屏");
														} else {
															onfullscreen_click();
															el.html("取消全屏");
														}
													}
												});
												contextMenuConfig.push({
													type: "line"
												});
											} else {
												contextMenuConfig.push({
													type: "line"
												});
											}

											if (self.isTextTrack) {
												contextMenuConfig.push({
													type: "menu",
													title: "字幕",
													menu: (function(lang, tracks) {
														var menus = [];
														jQuery.each(tracks, function(name, value) {
															var textlang = name == "cn" ? "中文/cn" : name == "en" ? "英文/en" : undefined;
															if (typeof textlang != "undefined") {
																menus.push({
																	type: "checkbox",
																	title: textlang,
																	value: name,
																	activeItem: (lang == name),
																	callback: function(video, el, evt) {
																		self.avticeTracks(jQuery(el).data("data-value"));
																	}
																});
															}
														});
														return menus;
													})(video.languaged, options.textTracks())
												});
												contextMenuConfig.push({
													type: "line"
												});
											}

											jQuery.each([
												/*{
											type: "button",
											title: self.isSkipMovie ? "开启试看" : "正常观影",
											callback: function(video, el, evt) {
												if (self.isSkipMovie) {
													self.isSkipMovie = false;
													el.html("正常观影");
												} else {
													self.isSkipMovie = true;
													el.html("开启试看");
												}
											}
										}, {
											type: "line"
										}, */
												{
													type: "menu",
													title: "声音",
													menu: [{
														type: "button",
														title: video.muted ? "正常" : "静音",
														callback: function(video, el, evt) {
															if (video.muted) {
																video.volume = 1;
																video.muted = false;
																el.html("静音");
																self["onmuted_event"]({
																	status: 'VIDEO_NORMAL_VOLUME'
																});
															} else {
																video.volume = 0;
																video.muted = true;
																el.html("正常");
																self["onmuted_event"]({
																	status: 'VIDEO_MOUTED'
																});
															}
														}
													}, {
														type: "line"
													}, {
														type: "checkbox",
														title: "最大声音",
														value: 1,
														activeItem: (video.volume <= 1 && video.volume > 0.6),
														callback: function(video, el, evt) {
															video.volume = jQuery(el).data("data-value");
														}
													}, {
														type: "checkbox",
														title: "中等声音",
														value: 0.6,
														activeItem: (video.volume <= 0.6 && video.volume > 0.2),
														callback: function(video, el, evt) {
															video.volume = jQuery(el).data("data-value");
														}
													}, {
														type: "checkbox",
														title: "最小声音",
														value: 0.2,
														activeItem: (video.volume <= 0.2),
														callback: function(video, el, evt) {
															video.volume = jQuery(el).data("data-value");
														}
													}]
												}, {
													type: "line"
												}, {
													type: "menu",
													title: "播放速度",
													menu: [{
														type: "checkbox",
														title: "较慢速度(0.5X)",
														value: 0.5,
														activeItem: (video.playbackRate == 0.5),
														callback: function(video, el, evt) {
															video.playbackRate = jQuery(el).data("data-value");
														}
													}, {
														type: "checkbox",
														title: "正常速度(1X)",
														value: 1,
														activeItem: (video.playbackRate == 1),
														callback: function(video, el, evt) {
															video.playbackRate = jQuery(el).data("data-value");
														}
													}, {
														type: "checkbox",
														title: "较快速度(1.5X)",
														value: 1.5,
														activeItem: (video.playbackRate == 1.5),
														callback: function(video, el, evt) {
															video.playbackRate = jQuery(el).data("data-value");
														}
													}, {
														type: "checkbox",
														title: "最快速度(2X)",
														value: 2,
														activeItem: (video.playbackRate == 2),
														callback: function(video, el, evt) {
															video.playbackRate = jQuery(el).data("data-value");
														}
													}]
												}
												/*, {
												type: "line"
											}, {
												type: "menu",
												title: "访问网站",
												menu: [{
													type: "button",
													title: "jlpm框架",
													callback: function() {
														win.open("https://github.com/ereddate/jlpm");
													}
												}, {
													type: "button",
													title: "easyjs模块管理",
													callback: function() {
														win.open("https://github.com/ereddate/easyjs");
													}
												}, {
													type: "button",
													title: "html5video播放器",
													callback: function() {
														win.open("https://github.com/ereddate/html5video");
													}
												}, {
													type: "line"
												}, {
													type: "button",
													title: "开发者(ereddate)微博",
													callback: function() {
														win.open("http://weibo.com/iliulancom");
													}
												}]
											}*/
											], function() {
												contextMenuConfig.push(this);
											});
											video.oncontextmenu = function(e) {
												e.preventDefault();
												if (isCanplay) {
													var menu = jQuery.contextMenu.exec(jQuery("#video_html5_api"), contextMenuConfig),
														top = videoplayer.getXY(video, videobox, menu, e).top,
														left = videoplayer.getXY(video, videobox, menu, e).left;
													menu.css({
														top: top,
														left: left
													}).show();
												}
											};
										} else {
											video.oncontextmenu = function(e) {
												e.preventDefault();
											};
										}
										break;
								}
							}
						},
						onvolume_change = function() {
							var volume = this.volume;
							if (this.muted || this.volume == 0) {
								eventFun.ontimeinfo.call(self, "静音");
								self.mutedbutton.addClass("mutedbutton").removeClass('volumebutton');
								var x = "-" + self.volumeButton.width() / 2 + "px";
								self.volumeSliderPro.css({
									width: x
								});
								self.volumeButton.css({
									left: x
								});
							} else {
								eventFun.ontimeinfo.call(self, "正常");
								self.mutedbutton.addClass("volumebutton").removeClass('mutedbutton');
								var x = self.volumeBox.width() * volume;
								x = x - 2 <= 0 ? 0 : x + 2 >= self.volumeBox.width() ? self.volumeBox.width() : x;
								x = x - self.volumeButton.width() / 2 <= 0 ? 0 : x - self.volumeButton.width() / 2;
								self.volumeSliderPro.css({
									width: x + self.volumeButton.width() / 2 + "px"
								});
								self.volumeButton.css({
									left: x + "px"
								});
							}
						},
						onrang_change = function() {
							video.currentTime = this.value;
							if (!dragging) {
								eventFun.ontimeinfo.call(self, "调整播放进度");
								video.play();
							}
						},
						onmuted_click = function() {
							if (video.muted) {
								video.volume = 1;
								//self.volumeButton[0].value = 10;
								video.muted = false;
								self["onmuted_event"]({
									status: 'VIDEO_NORMAL_VOLUME'
								});
							} else {
								video.volume = 0;
								//self.volumeButton[0].value = 0;
								video.muted = true;
								self["onmuted_event"]({
									status: 'VIDEO_MOUTED'
								});
							}
						},
						onplay_click = function() {
							if (isCanplay) {
								if (video.paused || video.ended) {
									video.play();
									if (self.isSkipMovie) {
										eventFun.ontimeinfo.call(self, "开始试看");
									} else {
										eventFun.ontimeinfo.call(self, "开始播放");
									}
								} else {
									video.pause();
									if (self.isSkipMovie) {
										eventFun.ontimeinfo.call(self, "暂停试看");
									} else {
										eventFun.ontimeinfo.call(self, "暂停播放");
									}
								}
							}
						},
						onplay_change = function(type) {
							if (isCanplay) {
								if (isopr) {
									if (type == "play") {
										self.pausebutton.trigger('click');
									} else if (type == "pause") {
										self.playbutton.trigger('click');
									}
								} else {
									onplay_click.call(self.playbutton[0]);
								}
							}
						},
						onrang_click = function() {
							video.pause();
							video.currentTime = self.playtime[0].value;
							video.play();
						},
						onfullscreen_nopc_click = function() {
							if (!video.fullscreened) {
								videobox.addClass('msiefullscreen').css({
									"width": "100%",
									"height": "100%"
								});
								video.fullscreened = true;
								jQuery(video).css("height", "100%");
							}
							video.width = videobox.width();
						},
						onfullscreen_click = function() {
							if (isie && parseInt(isie[2]) <= 10) {
								onfullscreen_click_msie()
								return;
							}
							var videoboxA = videobox[0];
							var i = self.video.buffered.length - 1;
							if (!video.fullscreened) {
								//video.fullscreened = true;
								//console.log('fullscreened')
								videoplayer.fullscreen.call(videoboxA, true, function() {
									jQuery(videoboxA).data("size", {
										dfwidth: jQuery(videoboxA).width(),
										dfheight: jQuery(videoboxA).height()
									});
									jQuery([videoboxA, video]).each(function() {
										jQuery(this).css({
											width: "100%",
											height: "100%"
										});
									});

									/*if (self.video.buffered.end(i) < self.video.duration) {
										self.pullinBox.show().css({
											top: self.videobox.height() / 2 - self.pullinBox.height() / 2,
											left: self.videobox.width() / 2 - self.pullinBox.width() / 2,
										});
									}*/
								});
							} else {
								//console.log('nofullscreen')
								//video.fullscreened = false;
								videoplayer.fullscreen.call(videoboxA, false, function() {
									jQuery(videoboxA).each(function() {
										var val = jQuery(this).data("size");
										jQuery(this).css({
											width: val.dfwidth,
											height: val.dfheight
										});
									});
									/*if (self.video.buffered.end(i) < self.video.duration) {
										self.pullinBox.show().css({
											top: self.videobox.height() / 2 - self.pullinBox.height() / 2,
											left: self.videobox.width() / 2 - self.pullinBox.width() / 2,
										});
									}*/
								});
							}
						},
						onfullscreen_click_msie = function() {
							if (!video.fullscreened) {
								videobox.addClass('msiefullscreen').css({
									"width": "100%",
									"height": "100%"
								});
								video.fullscreened = true;
								jQuery(video).css("height", "100%");
								self.fullscreenButton.addClass('nofullscreen').removeClass('fullscreen');
								eventFun.ontimeinfo.call(self, "进入全屏(按ESC键退出全屏)");
								self["onfullscreen_event"]({
									status: 'VIDEO_FULLSCREENED'
								});
							} else {
								videobox.removeClass('msiefullscreen').css({
									"width": options.width,
									"height": options.height
								});
								video.fullscreened = false;
								jQuery(video).css("height", "100%");
								self.fullscreenButton.addClass('fullscreen').removeClass('nofullscreen');
								eventFun.ontimeinfo.call(self, "退出全屏");
								self["onfullscreen_event"]({
									status: 'VIDEO_EXITFULLSCREEN'
								});
							}
							video.width = jQuery(doc).width();
						},
						onfullscreenkeyup_msie = function(e) {
							if (e.keyCode == 27 && video.fullscreened) {
								videobox.removeClass('msiefullscreen').css({
									"width": options.width,
									"height": options.height
								});
								video.fullscreened = false;
								jQuery(video).css("height", "100%");
								video.width = videobox.width();
								self.fullscreenButton.addClass('fullscreen').removeClass('nofullscreen');
								eventFun.ontimeinfo.call(self, "退出全屏");
								self["onfullscreen_event"]({
									status: 'VIDEO_KEYUP_EXITFULLSCREEN'
								});
							}
						},
						onfullscreenchange = function() {
							if (doc.fullscreen || doc.webkitIsFullScreen || doc.mozFullScreen || doc.fullscreenElement || false) {} else {
								video.fullscreened = false;
								jQuery(video).css("height", "100%");
								video.width = videobox.width();
								self.fullscreenButton.addClass('fullscreen').removeClass('nofullscreen');
								eventFun.ontimeinfo.call(self, "退出全屏");
							}
						},
						onvolumeBox_mousedown = function(e) {
							if (e.button == 0) {
								var x = e.clientX - parseFloat(self.volumeBox.offset().left);
								var value = x / self.volumeBox.width();
								self.video.volume = value;
							}
							return false;
						},
						onvolumeBox_mouseup = function(e) {
							return false;
						},
						onvolumeButton_mousedown = function(e) {
							var evt = e.target;
							if (jQuery(evt).hasClass('volume_slider_button')) {
								volume_dragging = true;
								volume_mouseX = parseInt(e.clientX);
								volume_dragX = volume_mouseX;
								volume_objX = parseInt(jQuery(evt).css("left")) + (jQuery(evt).width() / 2);
							}
							return false;
						},
						onvolumeButton_mousemove = function(e) {
							if (volume_dragging == true) {
								volume_dragX = e.clientX - volume_mouseX + volume_objX;
								clearTimeout(slideTimeout);
								slideTimeout = setTimeout(function() {
									var value = volume_dragX / self.volumeBox.width();
									value = value <= 0 ? 0 : value >= 1 ? 1 : value;
									video.volume = value;
								}, 5);
							}
							return false;
						},
						onvolumeButton_mouseup = function(e) {
							volume_dragging = false;
							return false;
						},
						onvideosliderbutton_mousedown = function(e) {
							var evt = e.target;
							if (jQuery(evt).hasClass('video_slider_button')) {
								dragging = true;
								mouseX = parseInt(e.clientX);
								dragX = mouseX;
								objX = parseInt(jQuery(evt).css("left"));
							}
							return false;
						},
						onvideosliderbutton_mousemove = function(e) {
							if (dragging == true) {
								dragX = e.clientX - mouseX + objX;
								clearTimeout(slideTimeout);
								slideTimeout = setTimeout(function() {
									var value = dragX / self.videoSlider.width() * video.duration;
									self.playtime[0].value = value;
									video.currentTime = self.playtime[0].value;
								}, 5);
							}
							return false;
						},
						onvideosliderbutton_mouseup = function(e) {
							dragging = false;
							return false;
						},
						onvideoslider_mousemove = function(e) {
							self.videoSliderTip.hide();
							if (!self.isSetPoint && !self.editTextTrack) {
								clearTimeout(hideTipTimeout);
								clearTimeout(showTipTimeout);
								showTipTimeout = setTimeout(function() {
									var mouseX = parseInt(e.clientX);
									var x = mouseX - parseFloat(self.videoSlider.offset().left);
									var left = x - parseFloat(self.videoSliderButton.width()) / 2;
									var vswidth = parseFloat(self.videoSlider.width());
									var vrate = x / vswidth * video.duration;
									if (self.videoSliderTip.data("vrate") != vrate) {
										self.videoSliderTip.data("vrate", vrate).find("span").html(videoplayer.getTime(vrate));
										self.videoSliderTip.stop(1, 1).animate({
											"left": left - (self.videoSliderTip.width() / 2) + "px"
										}, 50, function() {
											self.videoSliderTip.show();
											hideTipTimeout = setTimeout(function() {
												self.videoSliderTip.hide();
											}, 1500);
										});
									}
								}, 500);
							}
						},
						onvideoslider_mousedown = function(e) {
							if (e.button == 0) {
								var mouseX = parseInt(e.clientX);
								objX = parseFloat(self.videoSliderButton.css("left"));
								var x = mouseX - parseFloat(self.videoSlider.offset().left) - parseFloat(self.videoSliderButton.width()) / 2;
								var end = video.skipMovie;
								var value = x / self.videoSlider.width() * video.duration;
								if (self.isSkipMovie && value >= videoplayer.toSeconds(end[1])) {
									video.currentTime = videoplayer.toSeconds(end[1]);
									return;
								} else {
									self.playtime[0].value = value;
									video.currentTime = value;
								}
								/*self.videoSliderButton.stop(1,1).animate({
									"left": x + "px"
								}, "fast");
								self.videoSliderpro.stop(1,1).animate({
									"width": (x + 10) + "px"
								}, "fast");*/
							}
						},
						onvideoslider_mouseup = function(e) {
							/*clearTimeout(slideTimeout);
							slideTimeout = setTimeout(function() {
								//if (autoplay && video.seeking) video.play();
							}, 500);*/
						},
						onrangvolume = function() {
							video.volume = this.value / 10;
						},
						onvideo_mousemove = function(e) {
							_oldX = e.clientX;
							_oldY = e.clientY;
							clearTimeout(videomousemoveTimeoutA);
							videomousemoveTimeoutA = setTimeout(function() {
								if (video.fullscreened) {
									self.videoControlShow();
								}
							}, 1);
							return false;
						},
						onvideocontrol_mouseenter = function(e) {
							clearTimeout(videomousemoveTimeout);
							self.videoControlShow();
						},
						onvideocontrol_mouseleave = function(e) {
							clearTimeout(videomousemoveTimeout);
							videomousemoveTimeout = setTimeout(function() {
								//if (_oldX == e.clientX && _oldY == e.clientY) {
								self.videoControlHide();
								//}
							}, 3000);
						};

					videobox.css({
						"width": options.width,
						"height": options.height
					});
					if (video) {
						videobox.append(videoplayer.tmpl.replace(/\{\$name\}/ig, self.name).replace(/\{\$url\}/ig, self.site));
						jQuery.extend(self, {
							playbutton: jQuery(".playbutton"),
							mutedbutton: jQuery(".volumebutton"),
							pullinBox: jQuery(".pullin"),
							//fullscreenbutton: jQuery(".fullscreen"),
							timelen: jQuery("#video_len"),
							videoSlider: jQuery(".video_slider"),
							playtime: jQuery("input[name=playtime]"),
							videoSliderButton: jQuery(".video_slider_button"),
							videoSliderpro: jQuery(".video_slider_back"),
							fullscreenButton: jQuery("button[name=fullscreen]"),
							videoBuffer: jQuery(".video_buffer"),
							volumeBox: jQuery(".volume_slider"),
							volumeButton: jQuery(".volume_slider_button"),
							volumeSliderPro: jQuery(".volume_slider_backA"),
							videoInfo: jQuery("#video_info"),
							videoLogo: jQuery("#video_logo"),
							videoControl: jQuery(".video_control"),
							videoCenterplay: jQuery(".centerplay"),
							videoLoading: jQuery(".loading"),
							videoSliderTip: jQuery(".video_slider_tip"),
							bigTextTrack: jQuery('.bigTextTrack')
						});
						//try {
						eventFun.ontimelogo.call(self, options.logo || "");
						var initplayer_event = function() {
								videobox.hover(function() {
									if (isCanplay) {
										self.onscreenin_event({
											status: 'VIDEO_SCREENIN'
										});
										self.videoControlShow();
									}
								}, function() {
									if (isCanplay) {
										self.onscreenout_event({
											status: 'VIDEO_SCREENOUT'
										});
										self.videoControlHide();
									}
								});
								if (self.editTextTrack == false || self.isSetPoint == false) {
									jQuery(video).on("click", function() {
										onplay_change("play");
									}).on("volumechange", onvolume_change);
									videobox.on("mousedown", onvideo_mousedown).on("mousemove", onvideo_mousemove);
									self.videoCenterplay.on("click", function() {
										onplay_change("pause");
									});
									if (self.isFullscreen) self.fullscreenButton.on("click", onfullscreen_click);
									if (isie) jQuery(doc).on("keyup", onfullscreenkeyup_msie);
									self.playtime.on("click", onrang_click).on("change", onrang_change);
									self.volumeButton.on("change", onrangvolume);
									self.mutedbutton.on("click", onmuted_click);
									self.playbutton.on("click", onplay_click);
									self.videoSlider.on("mousemove", onvideoslider_mousemove);
									self.videoControl.on("mouseleave", onvideocontrol_mouseleave).on("mouseenter", onvideocontrol_mouseenter);
								}
								if (!self.isFullscreen) {
									self.videoControl.addClass('nofullscreenbutton');
								}
								self.videoSlider.on("mousedown", onvideoslider_mousedown).on("mouseup", onvideoslider_mouseup);
								self.videoSlider.on("mousedown", onvideosliderbutton_mousedown).on("mouseup", onvideosliderbutton_mouseup).on("mousemove", onvideosliderbutton_mousemove);
								self.volumeBox.on("mousedown", onvolumeBox_mousedown).on("mouseup", onvolumeBox_mouseup);
								self.volumeBox.on("mousedown", onvolumeButton_mousedown).on("mouseup", onvolumeButton_mouseup).on("mousemove", onvolumeButton_mousemove);
								//if (self.isSetPoint) self.videoSliderButton.hide();
								if (options.isTextTrack && options.isTextTrack == true) {
									var TextTrackCue = self.textTracks = function(context, start, end) {
											return {
												text: context,
												start: start,
												end: end
											};
										},
										avticeTracks = self.avticeTracks = function(lang) {
											video.textlist = [];
											video.languaged = lang;
											var texttrack = video.addTextTrack("caption");
											jQuery.each(options.textTracks(), function(name, value) {
												if (name == video.languaged) {
													jQuery.each(value, function(i, svalue) {
														svalue = svalue.split('|');
														texttrack.addCue(new TextTrackCue(svalue[2], svalue[0], svalue[1], "", "", "", true));
													});
												}
											});
										};

									video.addTextTrack = function(type) {
										var texttrack;
										texttrack = jQuery(".caption").length > 0 ? jQuery(".caption") : jQuery("<div></div>").addClass("caption");
										texttrack.back = jQuery(".caption_back", texttrack).length > 0 ? jQuery(".caption_back", texttrack) : jQuery("<div></div>").addClass("caption_back");
										texttrack.caption = jQuery(".caption_text", texttrack).length > 0 ? jQuery(".caption_text", texttrack) : jQuery("<div></div>").addClass("caption_text");
										texttrack.append(texttrack.back).append(texttrack.caption);
										video.textbox = texttrack;
										texttrack.insertBefore(self.videoCenterplay)
										return video.addTextTrack;
									};
									video.textlist = [];
									video.addTextTrack.addCue = function(obj) {
										video.textlist.push(obj);
									};
									if (options.textLanguage) avticeTracks(options.textLanguage);
								}
							},
							initOptions = function() {
								if (options.url) {
									if (typeof options.url == "string") options.url = options.url.split(' ');
									jQuery.each(options.url, function(i, file) {
										var type = videoplayer.gettype(file);
										if (type) {
											jQuery(video).append(jQuery("<source></source>").attr({
												"src": file,
												"type": type
											}));
										}
									});
									delete options.url;
								}
								if (typeof options.autoplay != 'undefined') {
									autoplay = options.autoplay;
									delete options.autoplay;
								}
								var attrs = {};
								jQuery.each(options, function(name, value) {
									if (!/textTracks|defaultMuted|defaultPlaybackRate|params/.test(name)) attrs[name] = value;
								});
								jQuery(video).attr(attrs);
								jQuery(".videohome").css("height", jQuery(video).parent().height());
								video.width = videobox.width();
								video.height = videobox.height();
								self.pullinBox.hide();
								video.defaultMuted = options.defaultMuted;
								video.volume = .5;
								video.fullscreened = false;
								video.looped = options.loop;
								video.autobuffer = true;
								video.skipMovie = options.skipMovie && options.skipMovie().split('|') || [];
							};
						if (video.canPlayType) {



							/*
							loadstart //客户端开始请求数据
							progress //客户端正在请求数据
							suspend //延迟拉取
							abort //客户端主动终止拉取（不是因为错误引起）
							error //请求数据时遇到错误
							stalled //网速失速
							loadedmetadata//成功获取资源长度
							loadeddata //
							waiting //等待数据，并非错误
							playing //开始回放
							canplay //可以播放，但中途可能因为加载而暂停
							canplaythrough //可以播放，歌曲全部加载完毕
							seeking //寻找中
							seeked //寻找完毕
							timeupdate //播放时间改变
							ended //播放结束
							ratechange //播放速率改变
							durationchange //资源长度改变
							volumechange //音量改变
							*/

							/*videobox[0].onwebkitfullscreenchange = videobox[0].onmozfullscreenchange = videobox[0].onfullscreenchange = function(e) {
								eventFun.onfullscreenchange.call(self, function(data) {
									self.onfullscreen_event(data, e);
								}, this, e);
							};*/
							jQuery(win).on("resize", function(e) {
								var target = this;
								clearTimeout(fullscreenTimeout);
								fullscreenTimeout = setTimeout(function() {
									eventFun.onfullscreenchange.call(self, function(data) {
										self.onfullscreen_event(data, e);
									}, target, e);
								}, 1);
							});

							function videoStatus() {
								switch (video.readyState) {
									case 2:
										self.pullinBox.show().css({
											top: self.videobox.height() / 2 - self.pullinBox.height() / 2,
											left: self.videobox.width() / 2 - self.pullinBox.width() / 2,
										}).html('正在努力拉取中... ');
										break;
									case 1:
									case 3:
									case 4:
										self.pullinBox.hide();
										break;
								}
							}
							jQuery.each(["error", "canplay", "loadedmetadata", "timeupdate", "playing", "pause", "loadstart", "ended", "stalled", "waiting", "progress", "loadeddata", "durationchange", "suspend", "seeking", "seeked", "canplaythrough", "abort", "emptied"], function(i, name) {
								jQuery(video).on(name, function(e) {
									videoStatus();
									eventFun['on' + name].call(self, function(data) {
										self['on' + name + '_event'](data, e);
									}, this, e);
								});
							});
							jQuery.each(["play", "pause"], function(i, name) {
								self[name] = function() {
									if (self.video) self.video[name]();
								};
							});
							initOptions();
							initplayer_event();
							jQuery.each([self.videoControl, self.videoLogo, self.videoCenterplay, self.videoInfo, self.video.textbox, self.pullinBox], function(i, obj) {
								if (obj) obj.on('contextmenu', function(e) {
									e.preventDefault();
								});
							});
						} else {
							eventFun.ontimeinfo.call(self, "你的浏览器不支持此格式视频");
						}
						//} catch (e) {
						//alert(e);
						//}
					}
				} else {
					videobox.append('<div id="video_info" class="video_info">对不起，您的浏览器无法播放此视频.</div>');
				}
			} else {}
			return this;
		},
		addBigTextTrackItem: function(value) {
			var self = this;
			var elem = jQuery('<span></span>').html(value).addClass('bttDiv');
			jQuery('.bigTextTrack').append(elem);
			var random = videoplayer.random(20, 10) * 1000,
				line = self.videobox.height() / 20;
			randomNum += 1;
			if (randomNum >= line) randomNum = 0;
			elem.attr('data-matev', "-" + (self.video.width + parseFloat(elem.width()))).css({
				position: 'absolute',
				display: 'block',
				width: elem.width(),
				top: randomNum * 30,
				left: self.video.width
			});
			if (self.video.paused) {
				elem.stop(1, 1);
			} else {
				elem.animate({
					left: elem.attr('data-matev')
				}, random, function() {
					elem.remove();
				});
			}
		},
		vGoto: function(time, caption) {
			var self = this;
			time = time + '';
			if (typeof time == "string" && /((\S+)[\:])*/.test(time) && self.video) {
				self.video.currentTime = videoplayer.toSeconds(time);
				if (self.video.textbox) {
					self.video.textbox.caption.html(caption);
				}
			}
		},
		getVideoTime: function() {
			var self = this;
			return videoplayer.getTime(self.video.currentTime, self.video.duration);
		},
		videoControlShow: function(callback) {
			var self = this;
			if (!self.isControl) {
				if (self.video.textbox) self.video.textbox.stop(1, 1).animate({
					bottom: "30px"
				});
				if (callback) callback();
				return;
			}
			if (callback) callback();
			clearTimeout(swhiTimeout);
			swhiTimeout = setTimeout(function() {
				self.videoLoading.hide();
				if (self.video.textbox) self.video.textbox.stop(1, 1).animate({
					bottom: "50px"
				});
				self.videoControl.stop(1, 1).animate({
					bottom: 0
				}, "fast", function() {
					//self.videoSliderTip.show();
				});
			}, 500);
		},
		videoControlHide: function(callback) {
			var self = this;
			if (!self.isControl) {
				if (self.video.textbox) self.video.textbox.stop(1, 1).animate({
					bottom: "30px"
				});
				if (callback) callback();
				return;
			}
			if (self.editTextTrack == false && self.isSetPoint == false) {
				if (callback) callback();
				clearTimeout(hideTipTimeout);
				clearTimeout(showTipTimeout);
				self.videoSliderTip.hide();
				clearTimeout(swhiTimeout);
				swhiTimeout = setTimeout(function() {
					self.videoControl.stop(1, 1).animate({
						bottom: "-" + self.videoControl.height()
					}, "fast", function() {
						self.videoLoading.show();
						if (self.video.textbox) self.video.textbox.stop(1, 1).animate({
							bottom: "30px"
						});
					});
				}, 500);
			}
		}
	};
	videoplayer.fn.init.prototype = videoplayer.fn;
	win.videoplayer = videoplayer;

	var jsonp = function(url, success, error) {
		return new jsonp.fn.init(url, success, error);
	};
	jsonp.fn = jsonp.prototype = {
		init: function(url, success, error) {
			jQuery.extend(this, {
				url: url,
				success: success,
				error: error
			});
			jQuery.ajax({
				url: /\?/.test(url) ? url + "&r=" + Math.random() : url + "?r=" + Math.random(),
				dataType: "jsonp",
				jsonp: "callback",
				timeout: 50000,
				cache: false,
				success: function(data) {
					success(data);
				},
				error: function(xhr, status, err) {
					error(xhr, status, err);
				}
			});
			return this;
		}
	};
	jsonp.fn.init.prototype = jsonp.fn;

	exports.jsonp = jsonp;
	exports.videoplayer = videoplayer;
	exports.videoPoint = videoPoint;
});
