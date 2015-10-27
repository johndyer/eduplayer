


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
		playerProgressUrl = '';
		
	
	var courseController = new DtsCoursesController(id, player, baseVideoUrl, baseContentUrl, userCoursesUrl, courseInfoCallback, currentTimeUrl, playerProgressUrl);
	window.courseController = courseController;
	
	player.controller = courseController;

});

