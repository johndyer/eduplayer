$(function() {
	var id = 'eduplayer';
	
	var player = new Player(id);
	window.player = player;	
	
	var baseVideoUrl = 'https://d16d701c6pwcqb.cloudfront.net/',
		baseContentUrl = 'getfile.ashx?file=';		
	
	var courseController = new CoursesController(id, player);
	window.courseController = courseController;
	
	player.controller = courseController;
	
	var be101test = {
		videoUrls: [
			{"quality":"360p","url":"https://d16d701c6pwcqb.cloudfront.net/be101v3/BE101v3_u001_v001_lo.mp4"},
			{"quality":"480p","url":"https://d16d701c6pwcqb.cloudfront.net/be101v3/BE101v3_u001_v001.mp4"},
			{"quality":"720p","url":"https://d16d701c6pwcqb.cloudfront.net/be101v3/BE101v3_u001_v001_hd.mp4"}
		],
		slidesVideoUrl: "https://d16d701c6pwcqb.cloudfront.net/be101v3/BE101v3_u001_v001_ppt.mp4",
		slidesDataUrl: "",
		slidesPath: "",
		transcriptUrl: "/player/getfile.ashx?file=BE101v3/Transcripts/en-US/BE101v3_u001_v001_transcript.xml"		
	};
	
	var st106test = {
		videoUrls: [
			{"quality":"360p","url":"https://d16d701c6pwcqb.cloudfront.net/st106/ST106_u002_v001_lo.mp4"},
			{"quality":"480p","url":"https://d16d701c6pwcqb.cloudfront.net/st106/ST106_u002_v001.mp4"}
		],
		slidesVideoUrl: "",
		slidesDataUrl: "/player/getfile.ashx?file=st106/Slides/en-US/st106_u002_v001_slides.xml",
		slidesPath: "/player/getfile.ashx?file=st106/Slides/en-US/",
		transcriptUrl: "/player/getfile.ashx?file=st106/Transcripts/en-US/st106_u002_v001_transcript.xml"		
	};	
	
	
	var testData = be101test;
	
	
	player.loadCourse( 
			testData.videoUrls,
			testData.transcriptUrl,
			testData.slidesVideoUrl,
			testData.slidesDataUrl,
			testData.slidesPath);

});