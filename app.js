define(function(require, exports, module) {
	var app = require("html5video_pc");
	var a = app.videoplayer({
		logo: 'html5video',
		url: function(callback) {
			callback(['video/stronger.mp4']);
		},
		width: "1000",
		height: "480",
		isControl: true,
		loop: true,
		autoplay: true,
		isrightmenu: true,
		isFullscreen: true,
		isrecord: false,
		isSetPoint: false,
		isTextTrack: true,
		editTextTrack: false,
		textLanguage: "en",
		textTracks: function() {
			return {
				cn: ['0:00|0:50|中文字幕1 测试', '0:50|1:00|<a href="#" target="_blank">广告测试</a> 测试字幕内容，也可以是广告.', '1:50|2:00|中文字幕2 测试'],
				en: ['00:00:07,150|00:01:12,279|SASHA: One must be a sea to receive a polluted stream', '00:01:13,698|00:01:16,492|without becoming impure.', '00:01:17,452|00:01:20,829|Lo, I teach you the Overman.', '00:01:22,832|00:01:26,043|He is that sea.', '00:02:02,038|00:02:03,038|RHODES: What\'s the problem?', '00:02:04,290|00:02:06,834|Did you drink too much last night?', '00:02:18,012|00:02:23,183|I can hold my liquor much better than you, servicemen.', '00:02:23,434|00:02:25,769|That\'s just the rookies, and if you\'re not careful,', '00:02:25,854|00:02:26,895|you might end up like them,', '00:02:27,397|00:02:29,064|barfing your guts out inside your suit.', '00:02:30,191|00:02:31,817|Watch and learn! I\'m about to do some', '00:02:31,901|00:02:33,443|maneuvers only big boys can pull off!', '00:02:34,737|00:02:36,363|(REPORTERS TALKING INDISTINCTLY)', '00:02:42,453|00:02:43,453|(SCOFFS)', '00:03:08,313|00:03:11,690|You\'d better give up and admit defeat, Rhodey!', '00:03:11,941|00:03:16,278|Your War Machine is all about firepower, not speed. It\'s too heavy!', '00:03:23,870|00:03:26,455|You might as well admit it. You\'re never going to catch me!', '00:03:26,831|00:03:28,624|Just watch me!', '00:03:30,293|00:03:31,293|Gotcha!', '00:03:37,217|00:03:38,217|You keep forgetting one thing, Tony.']
			};
		},
		isSkipMovie: false,
		skipMovie: function() {
			return '0:00|0:50';
		},
		onscreenin_event: function(data) {
			console.log(data)
		},
		onscreenout_event: function(data) {
			console.log(data)
		},
		onfullscreen_event: function(data) {
			console.log(data)
		},
		onmuted_event: function(data) {
			console.log(data)
		},
		onerror_event: function(data, e) {
			console.log(data)
			console.log(e)
		},
		oncanplay_event: function(data, e) {
			console.log(data)
			console.log(e)
		},
		onloadedmetadata_event: function(data, e) {
			console.log(data)
			console.log(e)
		},
		ontimeupdate_event: function(data, e) {
			console.log(data)
			console.log(e)
		},
		onplaying_event: function(data, e) {
			console.log(data)
			console.log(e)
		},
		onpause_event: function(data, e) {
			console.log(data)
			console.log(e)
		},
		onloadstart_event: function(data, e) {
			console.log(data)
			console.log(e)
		},
		onended_event: function(data, e) {
			console.log(data)
			console.log(e)
		},
		onstalled_event: function(data, e) {
			console.log(data)
			console.log(e)
		},
		onwaiting_event: function(data, e) {
			console.log(data)
			console.log(e)
		},
		onprogress_event: function(data, e) {
			console.log(data)
			console.log(e)
		},
		onloadeddata_event: function(data, e) {
			console.log(data)
			console.log(e)
		},
		ondurationchange_event: function(data, e) {
			console.log(data)
			console.log(e)
		},
		onsuspend_event: function(data, e) {
			console.log(data)
			console.log(e)
		},
		onseeking_event: function(data, e) {
			console.log(data)
			console.log(e)
		},
		onseeked_event: function(data, e) {
			console.log(data)
			console.log(e)
		},
		oncanplaythrough_event: function(data, e) {
			console.log(data)
			console.log(e)
		},
		onabort_event: function(data, e) {
			console.log(data)
			console.log(e)
		}
	});
});
