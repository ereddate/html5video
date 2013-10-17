html5video
==========

无插件浏览是我们永远不变的目标

<code>方便的引用：

		\<link href="jq.html5video.css" type="text/css" rel="stylesheet" />
		
		\<script src="jquery.1.9.1.js"></script>
		
		\<script src="jq.html5video.js"></script>
		
		\<script>
			jQuery(function() {
				html5video({
					url: ["http://content.bitsontherun.com/videos/q1fx20VZ-52qL9xLP.mp4"],
					width: "800",
					height: "400",
					loop: true,
					autoplay: true,
					textTracks:[
						{
							context: "test1 test",
							start: 0.000,
							end: 0.500
						},
						{
							context: '<a href="#" target="_blank">AD test</a> adadfasdfas,asdfasdf.',
							start: 0.600,
							end: 1.000
						},
						{
							context: "test2 test",
							start: 1.500,
							end: 2.000
						}
					]
				});
			});
		\</script>
</code>
