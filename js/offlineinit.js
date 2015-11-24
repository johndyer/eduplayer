


$(function() {
	var id = 'eduplayer';
	
	var player = new Player(id);
	//buildFakeButtons(player);
	window.player = player;	
	
	
	var baseVideoUrl = 'coursefiles/',
		baseContentUrl = 'coursefiles/',
		userCoursesUrl = baseContentUrl + 'courses.json',
		courseInfoCallback = function(courseCode, language) {
			return baseContentUrl + courseCode.toUpperCase() + '/' + courseCode + '-' + language + '.json?date=' + (new Date());
		},
		currentTimeUrl = '',
		playerProgressUrl = '',
		defaultQualities = ['360p','480p']; // only _lo
		
	
	var courseController = new DtsCoursesController(id, player, baseVideoUrl, baseContentUrl, userCoursesUrl, courseInfoCallback, currentTimeUrl, playerProgressUrl, defaultQualities);
	window.courseController = courseController;
	
	player.controller = courseController;
	
	
	player.container.find('.player-header-navigation').append( $('<span style="color:#fff; white-space:nowrap;">&nbsp;&nbsp;©達拉斯神學院，請勿翻製</span>') );
	
	/*
	// don't show if the Chrome message is already there
	if (!player.message.is(':visible')) {
	
		player.showMessage(
			'<h2>Copyright Notice</h2>' + 
			'<p>Copyright by Dallas Theological Seminary and professors. This content (including videos, slides, and transcripts) may not be reproduced in any form without written consent from Dallas Theological Seminary.</p>' + 
			'<p>達拉斯神學院版權所有請勿翻製</p>'
			);
	}
	*/	
	

});

