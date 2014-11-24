seajs.config({
        debug: true,
        charset: "utf-8",
        alias: {
                videoplayer: "app.js",
                videoedit: "app1.js",
                texttrackedit: "app2.js",
                jqcookie: "plugs/jq.cookie/jq.cookie.js",
                jqcontextmenu: "plugs/jq.contextmenu/jq.contextmenu.js",
                html5video_pc: "plugs/html5video.pc/jq.html5video.js"
        }
});
var type = jQuery("#tp_page").attr("content");
type = type.split('_');
seajs.use(type[1] || "home");
