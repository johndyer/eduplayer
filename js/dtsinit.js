


$(function() {
	var id = 'eduplayer';
	
	var player = new Player(id);
	//buildFakeButtons(player);
	window.player = player;	
	
	
	var baseVideoUrl = 'https://d16d701c6pwcqb.cloudfront.net/',
		baseContentUrl = 'https:/media.dts.edu/player/getfile.ashx?file=',
		userCoursesUrl = 'https:/media.dts.edu/player/user-courses.ashx',	
		courseInfoCallback = function(courseCode, language) {
			return 'https:/media.dts.edu/player/video-list.ashx?course=' + courseCode.toString().toLowerCase() + '&language=' + language + '&' + document.location.search.replace('?', '').split('#')[0];

		},
		currentTimeUrl = 'https:/media.dts.edu/player/player-current.ashx',
		playerProgressUrl = 'https:/media.dts.edu/player/player-progress.ashx'
		;
	
	var courseController = new DtsCoursesController(id, player, baseVideoUrl, baseContentUrl, userCoursesUrl, courseInfoCallback, currentTimeUrl, playerProgressUrl);
	window.courseController = courseController;
	
	player.controller = courseController;


});
