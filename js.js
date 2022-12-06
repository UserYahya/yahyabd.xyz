/* [[Category:Wikipedia scripts]]
This was copied from [[User:Numbermaniac/goToTop.js]].
This script was created by Majr of the Minecraft Wiki.
The original script is available here:
http://minecraftwiki.net/User:Majr/goToTop.js */
$(function(){
'use strict';

$('body').append('<span id="to-top" class="noprint">▲ Go to top</span>');
var $topButton = $('#to-top');

$topButton.css({
	'color': '#000',
	'position': 'fixed',
	'bottom': '-30px',
	'left': '4px',
	'cursor': 'pointer',
	'transition': 'bottom 0.5s',
	'-webkit-transition': 'bottom 0.5s',
	'user-select': 'none',
	'-webkit-user-select': 'none',
	'-moz-user-select': 'none',
	'-ms-user-select': 'none'
}).click(function(){
	$('html, body').animate({scrollTop: 0},'slow');
});

$(window).scroll(function(){
	var appearAt;
	switch (mw.config.get("skin")) {
		case 'minerva':
			appearAt = 100;
			break;
		default:
			appearAt = $('#p-tb').parent().position().top + $('#p-tb').parent().outerHeight(true) - $(window).height() + 20;
	}
	if (appearAt < 100) {
		appearAt = 100;
	}
	if ($(window).scrollTop() > appearAt ) {
		$topButton.css('bottom', '4px');
	}else{
		$topButton.css('bottom', '-30px');
	}
});
});
