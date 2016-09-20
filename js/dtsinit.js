


$(function() {
	var id = 'eduplayer';
	
	var player = new Player(id);
	//buildFakeButtons(player);
	window.player = player;	
	
	
	var 
		baseVideoUrl = 'https://d16d701c6pwcqb.cloudfront.net/',
		//baseVideoUrl = 'https://dtsoe.s3.amazonaws.com/',
		baseContentUrl = 'https://media.dts.edu/player/getfile.ashx?file=',
		userCoursesUrl = 'https://media.dts.edu/player/user-courses.ashx',	
		courseInfoCallback = function(courseCode, language) {
			
			var querystring = document.location.search.replace('?', '').split('#')[0];
			
			var tokens = {},
				parts = querystring.replace('#', '').split('&');
				
			for (var i in parts) {
				var p = parts[i].split('=');
				tokens[p[0]] = p[1];
			}	
			
			delete tokens['course'];
			delete tokens['unit'];			
			delete tokens['video'];						
			delete tokens['language'];		
			
			var parts = [];
			for (var i in tokens) {
				parts.push(i + '=' + tokens[i]);
			}
			var extraQs = parts.join('&');		
			
			console.log(querystring, extraQs);								
			
			return 'https://media.dts.edu/player/video-list.ashx?course=' + courseCode.toString().toLowerCase() + '&language=' + language + '&' + extraQs;

		},
		currentTimeUrl = 'https://media.dts.edu/player/player-current.ashx',
		playerProgressUrl = 'https://media.dts.edu/player/player-progress.ashx',
		defaultQualities = ['360p','480p']
		;
	
	var courseController = new DtsCoursesController(id, player, baseVideoUrl, baseContentUrl, userCoursesUrl, courseInfoCallback, currentTimeUrl, playerProgressUrl, defaultQualities);
	window.courseController = courseController;
	
	player.controller = courseController;
	
	
	// add login info
	$('.player-header-buttons').append($('#dts-login'));


});
