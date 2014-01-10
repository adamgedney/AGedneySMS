var flash;
function getFlashMovie(movieName) {
    var isIE = navigator.appName.indexOf("Microsoft") != -1;
    return (isIE) ? window[movieName] : document[movieName];
}
function ready_function()
{

    if(getFlashMovie("higley_wigley"))
    {
        flash = getFlashMovie("higley_wigley");
        flashReady();
    }
}
// For version detection, set to min. required Flash Player version, or 0 (or 0.0.0), for no version detection.
var swfVersionStr = "10.2.0";
// To use express install, set to playerProductInstall.swf, otherwise the empty string.
var xiSwfUrlStr = "swf/playerProductInstall.swf";
var flashvars = {};
var params = {};
params.quality = "high";
params.bgcolor = "#ffffff";
params.allowscriptaccess = "always";
params.allowfullscreen = "true";
var attributes = {};
attributes.id = "higley_wigley";
attributes.name = "higley_wigley";
attributes.align = "middle";
swfobject.embedSWF(
    "swf/higley_wigley.swf", "flashContent",
    "100%", "100%",
    swfVersionStr, xiSwfUrlStr,
    flashvars, params, attributes);
// JavaScript enabled so display the flashContent div in case it is not replaced with a swf object.
swfobject.createCSS("#flashContent", "display:block;text-align:left;");