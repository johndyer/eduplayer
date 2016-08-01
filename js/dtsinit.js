


$(function() {
	var id = 'eduplayer';
	
	var player = new Player(id);
	//buildFakeButtons(player);
	window.player = player;	
	
	
	var baseVideoUrl = 'https://d16d701c6pwcqb.cloudfront.net/',
		baseContentUrl = 'https:/media.dts.edu/player/getfile.ashx?file=',
		userCoursesUrl = 'https:/media.dts.edu/player/user-courses.ashx?admin=true',	
		courseInfoCallback = function(courseCode, language) {
			return 'https:/media.dts.edu/player/video-list.ashx?course=' + courseCode.toString().toLowerCase() + '&language=' + language + '&' + document.location.search.replace('?', '').split('#')[0];

		},
		currentTimeUrl = 'https:/media.dts.edu/player/player-current.ashx',
		playerProgressUrl = 'https:/media.dts.edu/player/player-progress.ashx',
		defaultQualities = ['360p','480p']
		;
	
	var courseController = new DtsCoursesController(id, player, baseVideoUrl, baseContentUrl, userCoursesUrl, courseInfoCallback, currentTimeUrl, playerProgressUrl, defaultQualities);
	window.courseController = courseController;
	
	player.controller = courseController;


});
