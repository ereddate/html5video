/*
	目前只支持IE10、CHROME、OPERA、SAFARI等支持HTML5 VIDEO标签的浏览器，
	对于全屏功能因各浏览器支持情况不同展示效果也不同，但都已经实现全屏功能。
	调用格式：
	html5video({
		preload: "auto",
		poster: "",
		url:["demo1.mp4","demo.ogv"],
		autoplay:false
	});
*/
(function(win) {
	var doc = win.document;
	var videoplayer = function(options) {
		return new videoplayer.fn.init(options);
	};
	/*
	cookie
	*/
	jQuery.cookie = function(b, j, m) {
		if (typeof j != "undefined") {
			m = m || {};
			if (j === null) {
				j = "";
				m.expires = -1;
			}
			var e = "";
			if (m.expires && (typeof m.expires == "number" || m.expires.toUTCString)) {
				var f;
				if (typeof m.expires == "number") {
					f = new Date();
					f.setTime(f.getTime() + (m.expires * 24 * 60 * 60 * 1000));
				} else {
					f = m.expires;
				}
				e = "; expires=" + f.toUTCString();
			}
			var l = m.path ? "; path=" + m.path : "";
			var g = m.domain ? "; domain=" + m.domain : "";
			var a = m.secure ? "; secure" : "";
			document.cookie = [b, "=", encodeURIComponent(j), e, l, g, a].join("");
		} else {
			var d = null;
			if (document.cookie && document.cookie != "") {
				var k = document.cookie.split(";");
				for (var h = 0; h < k.length; h++) {
					var c = jQuery.trim(k[h]);
					if (c.substring(0, b.length + 1) == (b + "=")) {
						d = decodeURIComponent(c.substring(b.length + 1));
						break;
					}
				}
			}
			return d;
		}
	};

	/* 右键菜单 */

	jQuery.contextMenu = function(elem, ops) {
		if (jQuery("#contextMenu_main").length > 0) jQuery("#contextMenu_main").remove();
		var menu = jQuery("<div></div>").attr({
			id: "contextMenu_main",
			class: "contextMenu_main_css"
		});
		elem.parent().append(menu);
		var elemcode = jQuery("<ul></ul>"),
			gtimeout;
		jQuery.each(ops, function(i, value) {
			var li = jQuery("<li></li>");
			elemcode.append(li);
			switch (value.type) {
				case "text":
					li.addClass('contextMenu_text').html('<span>' + value.title + "</span>");
					break;
				case "line":
					li.addClass("contextMenu_line");
					break;
				case "button":
					li.addClass("contextMenu_button").html('<a href="">' + value.title + '</a>').click(function(e) {
						e.preventDefault();
						menu.hide();
						value.callback(elem[0], jQuery(this), e);
					});
					break;
				case "input":
					li.addClass('contextMenu_input').html('<input type="text" value="' + value.title + '" />');
					break;
			}
			menu.append(elemcode);
		});
		menu.hover(function() {
			clearTimeout(gtimeout);
		}, function() {
			clearTimeout(gtimeout);
			gtimeout = setTimeout(function() {
				menu.hide();
			}, 1000);
		});
		return menu;
	};

	/*设备识别*/

	var ua = navigator.userAgent.toLowerCase(),
		isie = /(msie) ([\w.]+)/.exec(ua) && /(msie) ([\w.]+)/.exec(ua)[1] == "msie",
		p = navigator.platform.toLowerCase(),
		ispc = (p.match(/win|mac|x11|linux/i) != null && !/win|mac|x11|linux/.test(p.match(/win|mac|x11|linux/i)[0])) || !/cros/.test(/(cros) [a-z 0-9]+ ([\d.]+)/.exec(ua));

	/*播放器*/

	videoplayer.fn = videoplayer.prototype = {
		constructor: videoplayer,
		name: "html5video",
		ver: "0.1.1",
		init: function(ops) {
			var canHtml5 = (function() {
				return doc.createElement("video").canPlayType;
			})();
			if (canHtml5 && ispc) {
				var videobox = jQuery("#video");
				videobox.css({
					"width": ops.width,
					"height": ops.height
				});
				videobox.append('<div id="video_control" class="video_control"><button type="button" name="play" class="playbutton"></button><input type="range" min="0" max="0" step="0" class="video_range" name="playtime" /><span id="video_len" class="video_len">0.00/0.00</span><div class="video_slider"><div class="video_slider_backA"><div class="video_buffer"></div><div class="video_slider_back"></div></div><div class="video_slider_button"></div></div><button type="button" name="muted" class="volumebutton"></button><input type="range" min="0" max="10" step="0" name="playvolume" class="playvolume" /><button type="button" name="fullscreen" class="fullscreen"></button></div><div id="video_logo" class="video_logo">' + this.name + '</div><div id="video_info" class="video_info"></div><div class="loading" style="display:none"><div class="dot"></div><div class="dot"></div><div class="dot"></div><div class="dot"></div><div class="dot"></div></div>');

				var video = jQuery("#video_html5_api");
				if (video.length > 0) {
					var self = this;
					var canpt = ['video/mp4; codecs="avc1.42E01E, mp4a.40.2"', 'video/ogg; codecs="theora, vorbis"', 'video/webm; codecs="vp8, vorbis"'],
						canpt_end = [],
						options = {
							preload: "auto",
							poster: "",
							loop: false,
							defaultMuted: false,
							defaultPlaybackRate: 1
						},
						playbutton = jQuery(".playbutton"),
						mutedbutton = jQuery(".volumebutton"),
						fullscreenbutton = jQuery(".fullscreen"),
						timelen = jQuery("#video_len"),
						videoSlider = jQuery(".video_slider"),
						playtime = jQuery("input[name=playtime]"),
						videoSliderButton = jQuery(".video_slider_button"),
						videoSliderpro = jQuery(".video_slider_back"),
						fullscreenButton = jQuery("button[name=fullscreen]"),
						videoBuffer = jQuery(".video_buffer"),
						volumeButton = jQuery("input[name=playvolume]"),
						videoInfo = jQuery("#video_info"),
						videoLogo = jQuery("#video_logo"),
						videoControl = jQuery(".video_control"),
						max = 0,
						connectNum = 0,
						connectNumMax = 3,
						playnum = 0,
						isCanplay = false,
						//isFullscreen = false,
						navtype = "",
						autoplay = true,
						infoTimeout = null,
						logoTimeout = null,
						info = [],
						dragging = false,
						videolen = 0,
						slideTimeout = null,
						swhiTimeout = null,
						status = "defalut",
						ispaused = false,
						mouseX, mouseY, objX, objY;
					var gettype = function(url) {
						var type = /\.(mp4|ogv)/.exec(url) && /\.(mp4|ogv)/.exec(url)[1];
						var types = {
							mp4: canpt[0],
							ogv: canpt[1],
							webm: canpt[2]
						};
						return types[type];
					},
						onloadstart = function() {
							ontimeinfo("正在连接视频");
						},
						ondurationchange = function() {
							videolen = this.duration;
							var max = getTime(this.duration);
							playtime.attr("max", this.duration);
							timelen.show().html("0:00/" + (max && max != "Infinity" ? max : "..."));
						},
						onloadedmetadata = function() {
							ontimeinfo("正在获取视频信息");
						},
						onloadeddata = function() {
							ontimeinfo("准备加载视频");
						},
						onprogress = function() {
							ontimeinfo("正在加载视频");
							if (video.paused) {
								jQuery(".loading").show();
							}
							if (this.buffered.length > 0) {
								var max = (this.duration.toFixed(1) / 60).toFixed(2);
								var i = this.buffered.length - 1;
								var left = (video.buffered.start(i).toFixed(1) / 60).toFixed(2) || 0,
									width = (video.buffered.end(i).toFixed(1) / 60).toFixed(2) || 0;
								width = ((width / max)) * videoSlider.width();
								if (width == videoSlider.width()) width = "100%";
								videoBuffer.attr("id", "bufferitem_" + i).css({
									"width": width
								});
							}
						},
						oncanplay = function() {
							if (status == "defalut") {
								var timeupdate = jQuery.cookie("timeupdate");
								if (timeupdate && video.currentSrc == timeupdate.split(', ')[0]) {
									this.currentTime = timeupdate.split(', ')[1];
								}
							}
							isCanplay = true;
							videoControl.animate({
								bottom: 0
							}, "slow");
						},
						oncanplaythrough = function() {
							if (autoplay && status == "defalut" || options.loop && status == "ended" || status == "defalut") video.play();
						},
						onseeking = function() {

						},
						onseeked = function() {

						},
						getTime = function(a, c) {
							c = c || a;
							var d = Math.floor(a % 60),
								e = Math.floor(a / 60 % 60),
								g = Math.floor(a / 3600),
								h = Math.floor(c / 60 % 60),
								k = Math.floor(c / 3600);
							if (isNaN(a) || Infinity === a) g = e = d = "-";
							g = 0 < g || 0 < k ? g + ":" : "";
							return g + (((g || 10 <= h) && 10 > e ? "0" + e : e) + ":") + (10 > d ? "0" + d : d)
						},
						ontimeupdate = function() {
							var max = getTime(this.duration); //(this.duration.toFixed(1) / 60).toFixed(2);
							//var time = (this.currentTime.toFixed(1) / 60).toFixed(2);
							var time = getTime(this.currentTime, this.duration);
							timelen.show().html(time + "/" + (max && max != "Infinity" ? max : "..."));
							var left = (this.currentTime / this.duration) * videoSlider.width();
							left = left <= 20 ? 0 : left - 20 >= videoSlider.width() ? left - 20 : left;
							playtime[0].value = this.currentTime;
							jQuery.each(video.textlist, function(i, value) {
								if (parseFloat(time) >= value.start && parseFloat(time) <= value.end) {
									jQuery(video.textbox).html(value.text).show();
								} else if (value.end < parseFloat(time)) {
									jQuery(video.textbox).hide();
								}
							});
							videoSliderButton.css({
								"left": left
							});
							videoSliderpro.css({
								"width": left
							});
							jQuery.cookie("timeupdate", "" + video.currentSrc + ", " + this.currentTime + "");
						},
						onpause = function() {
							if (status == "ended") {
								ontimeinfo("停止播放", "pause");
							} else {
								ontimeinfo("暂停播放", "pause");
							}
							playbutton.addClass("playbutton").removeClass('pausebutton');
						},
						onplaying = function() {
							jQuery(".loading").hide();
							ontimeinfo("开始播放", "play");
							playbutton.addClass("pausebutton").removeClass('playbutton');
						},
						onvolumechange = function() {
							var volume = this.volume * 10;
							if (this.muted || this.volume == 0) {
								ontimeinfo("静音");
								mutedbutton.addClass("mutedbutton").removeClass('volumebutton');
								volumeButton[0].value = 0;
							} else {
								ontimeinfo("修改音量");
								mutedbutton.addClass("volumebutton").removeClass('mutedbutton');
								volumeButton[0].value = volume;
							}
						},
						onended = function() {
							video.currentTime = 0;
							ontimeinfo("播放完成", "ended");
							if (status == "ended") {
								video.currentTime = 0;
							}
						},
						onstalled = function() {
							ontimeinfo("网速过慢，播放器将暂停缓冲后再播放");
							video.pause();
						},
						onabort = function() {
							connectNum += 1;
							if (connectNum < connectNumMax) {
								video.load();
							} else {
								video.pause();
								ontimeinfo("网络错误：对不起，您的浏览器无法播放此视频");
								jQuery(".loading").hide();
							}
						},
						onsuspend = function() {
							ontimeinfo("缓冲时间过长，浏览器尝试重新连接视频");
						},
						onwaiting = function() {
							video.pause();
							//ontimeinfo("请稍后...");
						},
						onrangchange = function() {
							video.currentTime = this.value;
							if (!dragging) {
								ontimeinfo("调整播放进度")
								video.play();
							}
						},
						onrangvolume = function() {
							video.volume = this.value / 10;
						},
						onmuted_click = function() {
							if (video.muted) {
								video.volume = 1;
								volumeButton[0].value = 10;
								video.muted = false;
							} else {
								video.volume = 0;
								volumeButton[0].value = 0;
								video.muted = true;
							}
						},
						onplay_click = function() {
							if (video.paused || video.ended) {
								video.play();
								ontimeinfo("开始播放");
							} else {
								video.pause();
								ontimeinfo("暂停播放");
							}
						},
						onerror = function() {
							if (video.error) {
								switch (video.error.code) {
									case 1:
										ontimeinfo("错误：你停止视频.");
										break;
									case 2:
										ontimeinfo("错误：网络错误-请稍后再试.");
										break;
									case 3:
										ontimeinfo("错误：视频连接断了.");
										break;
									case 4:
										ontimeinfo("错误：对不起，您的浏览器无法播放此视频.");
										break;
								}
								status = "ended";
								video.pause();
								jQuery(".loading").hide();
							}
						},
						onplaychange = function() {
							onplay_click.call(playbutton[0]);
						},
						onrangclick = function() {
							video.pause();
							video.currentTime = playtime[0].value;
							video.play();
						},
						getXY = function(menu, e) {
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
						onvideo_mousedown = function(e) {
							console.log(e.button)
							switch (e.button) {
								case 0:
									break;
								case 1:
									break;
								case 2:
									video.oncontextmenu = function(e) {
										e.preventDefault();
										if (isCanplay) {
											var menu = jQuery.contextMenu(jQuery("#video_html5_api"), [{
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
												title: video.fullscreened ? "取消全屏" : "开启全屏",
												callback: function(video, el, evt) {
													if (video.fullscreened) {
														onfullscreen_click_msie();
														el.html("开启全屏");
													} else {
														onfullscreen_click_msie();
														el.html("取消全屏");
													}
												}
											}, {
												type: "line"
											}, {
												type: "button",
												title: video.muted ? "放音" : "静音",
												callback: function(video, el, evt) {
													if (video.muted) {
														video.volume = 1;
														video.muted = false;
														el.html("静音");
													} else {
														video.volume = 0;
														video.muted = true;
														el.html("放音");
													}
												}
											}, {
												type: "button",
												title: "最大声音",
												callback: function(video, el, evt) {
													video.volume = 1;
												}
											}, {
												type: "button",
												title: "中等声音",
												callback: function(video, el, evt) {
													video.volume = 0.6;
												}
											}, {
												type: "button",
												title: "最小声音",
												callback: function(video, el, evt) {
													video.volume = 0.2;
												}
											}, {
												type: "line"
											}, {
												type: "button",
												title: "访问开发者(ereddate)网站",
												callback: function() {
													win.open("https://github.com/ereddate");
												}
											}]);

											var top = getXY(menu, e).top,
												left = getXY(menu, e).left;
											menu.css({
												top: top,
												left: left
											}).show();
										}
									};
									break;
							}
						},
						onfullscreen_click = function() {
							var videoboxA = videobox[0];
							if (!video.fullscreened) {
								if (video.webkitRequestFullScreen) {
									video.webkitRequestFullScreen();
									navtype = "webkit";
								} else if (videoboxA.mozRequestFullScreen) {
									videoboxA.mozRequestFullScreen();
									navtype = "moz";
								} else if (videoboxA.requestFullscreen) {
									videoboxA.requestFullscreen();
									navtype = "";
								}
								video.fullscreened = true;
								jQuery(video).css("height", "100%");
								fullscreenButton.addClass('nofullscreen').removeClass('fullscreen');
								ontimeinfo("进入全屏(按ESC键退出全屏)");
							} else {
								if (doc.webkitCancelFullScreen) {
									doc.webkitCancelFullScreen();
								} else if (doc.mozCancelFullScreen) {
									doc.mozCancelFullScreen();
								} else if (doc.exitFullscreen) {
									doc.exitFullscreen();
								}
								video.fullscreened = false;
								jQuery(video).css("height", "100%");
								fullscreenButton.addClass('fullscreen').removeClass('nofullscreen');
								ontimeinfo("退出全屏");
							}
							video.width = videobox.width();
						},
						onfullscreen_click_msie = function() {
							if (!video.fullscreened) {
								videobox.addClass('msiefullscreen').css({
									"width": "100%",
									"height": "100%"
								});
								video.fullscreened = true;
								jQuery(video).css("height", "100%");
								fullscreenButton.addClass('nofullscreen').removeClass('fullscreen');
								ontimeinfo("进入全屏(按ESC键退出全屏)");
							} else {
								videobox.removeClass('msiefullscreen').css({
									"width": ops.width,
									"height": ops.height
								});
								video.fullscreened = false;
								jQuery(video).css("height", "100%");
								fullscreenButton.addClass('fullscreen').removeClass('nofullscreen');
								ontimeinfo("退出全屏");
							}
							video.width = videobox.width();
						},
						onfullscreenkeyup_msie = function(e) {
							if (e.keyCode == 27 && video.fullscreened) {
								videobox.removeClass('msiefullscreen').css({
									"width": ops.width,
									"height": ops.height
								});
								video.fullscreened = false;
								jQuery(video).css("height", "100%");
								video.width = videobox.width();
								fullscreenButton.addClass('fullscreen').removeClass('nofullscreen');
								ontimeinfo("退出全屏");
							}
						},
						onfullscreenchange = function() {
							if (doc.fullscreen || doc.webkitIsFullScreen || doc.mozFullScreen || doc.fullscreenElement || false) {} else {
								video.fullscreened = false;
								jQuery(video).css("height", "100%");
								video.width = videobox.width();
								fullscreenButton.addClass('fullscreen').removeClass('nofullscreen');
								ontimeinfo("退出全屏");
							}
						},
						onvideosliderbutton_mousedown = function(e) {
							dragging = true;
							video.pause();
							mouseX = parseInt(e.clientX);
							objX = parseInt(jQuery(this).css("left"));
						},
						onvideosliderbutton_mousemove = function(e) {
							if (dragging == true) {
								var x = e.clientX - mouseX + objX;
								jQuery(this).css({
									"left": x + "px"
								});
								videoSliderpro.css({
									"width": x + "px"
								});
								var value = x / videoSlider.width() * video.duration;
								playtime[0].value = value;
							}
						},
						onvideosliderbutton_mouseup = function(e) {
							dragging = false;
							video.currentTime = playtime[0].value;
							clearTimeout(slideTimeout);
							slideTimeout = setTimeout(function() {
								video.play();
							}, 500);
						},
						onvideoslider_mousedown = function(e) {
							video.pause();
							var mouseX = parseInt(e.clientX);
							objX = parseFloat(videoSliderButton.css("left"));
							var x = mouseX - parseFloat(videoSlider.offset().left);
							videoSliderButton.stop().animate({
								"left": x + "px"
							}, "fast");
							videoSliderpro.stop().animate({
								"width": x + "px"
							}, "fast");
							var value = (x / videoSlider.width()) * video.duration;
							playtime[0].value = value;
							video.currentTime = value;
						},
						onvideoslider_mouseup = function(e) {
							clearTimeout(slideTimeout);
							slideTimeout = setTimeout(function() {
								video.play();
							}, 500);
						},
						ontimeinfo = function(info, type) {
							status = type || status;
							videoInfo.slideDown().html(info);
							clearTimeout(infoTimeout);
							infoTimeout = setTimeout(function() {
								videoInfo.slideUp().html("");
							}, 5000);
						},
						ontimelogo = function(info) {
							videoLogo.slideDown().html(this.name + info);
							clearTimeout(logoTimeout);
							logoTimeout = setTimeout(function() {
								videoLogo.slideUp();
							}, 7000);
						};
					try {
						ontimelogo.call(this, ops.logo && "/" + ops.logo || "");
						if (video[0].canPlayType) {
							if (ops.autoplay) {
								autoplay = ops.autoplay;
								delete ops.autoplay;
							}
							if (ops.url) {
								if (typeof ops.url == "string") ops.url = ops.url.split(' ');
								jQuery.each(ops.url, function(i, file) {
									video.append(jQuery("<source></source>").attr({
										"src": file,
										"type": gettype(file) || 'video/mp4; codecs="avc1.42E01E, mp4a.40.2"'
									}));
								});
								delete ops.url;
							}
							jQuery.extend(options, ops);
							video.attr(options).on("error", onerror).on("canplay", oncanplay).on("loadedmetadata", onloadedmetadata).on("timeupdate", ontimeupdate).on("playing", onplaying).on("pause", onpause).on("volumechange", onvolumechange).on("loadstart", onloadstart).on("ended", onended).on("stalled", onstalled).on("waiting", onwaiting).on("progress", onprogress).on("loadeddata", onloadeddata).on("durationchange", ondurationchange).on("suspend", onsuspend).on("seeking", onseeking).on("seeked", onseeked).on("canplaythrough", oncanplaythrough).on("abort", onabort);
							videobox.on("mousedown", onvideo_mousedown);
							//if (ispc) {
							videobox.hover(function() {
								if (isCanplay) {
									clearTimeout(swhiTimeout);
									swhiTimeout = setTimeout(function() {
										videoControl.slideDown();
									}, 500);
								}
							}, function() {
								if (isCanplay) {
									clearTimeout(swhiTimeout);
									swhiTimeout = setTimeout(function() {
										videoControl.slideUp();
									}, 1000);
								}
							});
							//}
							//if (!ispc && !isie) {
							//jQuery(doc).on("fullscreenchange webkitfullscreenchange mozfullscreenchange", onfullscreenchange);
							//fullscreenButton.on("click", onfullscreen_click);
							//} else {
							fullscreenButton.on("click", onfullscreen_click_msie);
							jQuery(doc).on("keyup", onfullscreenkeyup_msie);
							//}
							playtime.on("click", onrangclick).on("change", onrangchange);
							volumeButton.on("change", onrangvolume);
							mutedbutton.on("click", onmuted_click);
							playbutton.on("click", onplay_click);
							videoSliderButton.on("mousedown", onvideosliderbutton_mousedown).on("mouseup", onvideosliderbutton_mouseup).on("mousemove", onvideosliderbutton_mousemove);
							videoSlider.on("mousedown", onvideoslider_mousedown).on("mouseup", onvideoslider_mouseup);
							jQuery(".videohome").css("height", video.parent().height());
							video.on("click", onplaychange);
							video = video[0];
							var TextTrackCue = function(context, start, end) {
								return {
									text: context,
									start: start,
									end: end
								};
							};
							video.addTextTrack = function(type) {
								var texttrack;
								texttrack = jQuery("<div></div > ").addClass("caption");
								video.textbox = texttrack;
								jQuery(videobox).append(texttrack);
								return video.addTextTrack;
							};
							video.textlist = [];
							video.addTextTrack.addCue = function(obj) {
								video.textlist.push(obj);
							};
							video.autobuffer = true;
							video.width = videobox.width();
							video.height = videobox.height();
							video.defaultMuted = options.defaultMuted;
							video.volume = 1;
							video.fullscreened = false;
							var texttrack = video.addTextTrack("caption");
							jQuery.each(ops.textTracks, function(i, value) {
								texttrack.addCue(new TextTrackCue(value.context, value.start, value.end, "", "", "", true));
							});
							//video.load();
						} else {
							ontimeinfo("你的浏览器不支持此格式视频");
						}
					} catch (e) {
						alert(e)
					}
				}
			} else {

			}
		}
	};
	videoplayer.fn.init.prototype = videoplayer.fn;
	win.html5video = videoplayer;
})(window);