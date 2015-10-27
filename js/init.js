


$(function() {
	var id = 'dtsplayer';
	
	var player = new Player(id);
	//buildFakeButtons(player);
	window.player = player;	
	
	
	var baseVideoUrl = 'https://d16d701c6pwcqb.cloudfront.net/',
		baseContentUrl = 'getfile.ashx?file=';		
	
	var courseController = new DtsCoursesController(id, player, baseVideoUrl, baseContentUrl);
	window.courseController = courseController;
	
	player.controller = courseController;

	
	function buildFakeButtons(player) {
		var self = player,
			buttons = $('<div class="temp-buttons">' + 
								'<span data-video="https://d16d701c6pwcqb.cloudfront.net/be101v3/BE101v3_u001_v001_lo.mp4" ' + 
										"data-videos='[" +
											'{"quality":"360p","url":"https://d16d701c6pwcqb.cloudfront.net/be101v3/BE101v3_u001_v001_lo.mp4"},' + 
											'{"quality":"480p","url":"https://d16d701c6pwcqb.cloudfront.net/be101v3/BE101v3_u001_v001.mp4"},' + 
											'{"quality":"720p","url":"https://d16d701c6pwcqb.cloudfront.net/be101v3/BE101v3_u001_v001_hd.mp4"}' + 		
										"]' " + 										
										'data-transcript="/player/getfile.ashx?file=BE101v3/Transcripts/en-US/BE101v3_u001_v001_transcript.xml" ' + 
										'data-slidesvideo="https://d16d701c6pwcqb.cloudfront.net/be101v3/BE101v3_u001_v001_ppt.mp4">BE101v3</span>' +
										
								'<span data-video="https://d16d701c6pwcqb.cloudfront.net/ce101v2/CE101v2_u009_v002_lo.mp4" ' + 
										"data-videos='[" +
											'{"quality":"360p","url":"https://d16d701c6pwcqb.cloudfront.net/ce101v2/CE101v2_u009_v002_lo.mp4"},' + 
											'{"quality":"480p","url":"https://d16d701c6pwcqb.cloudfront.net/ce101v2/CE101v2_u009_v002.mp4"},' + 
											'{"quality":"720p","url":"https://d16d701c6pwcqb.cloudfront.net/ce101v2/CE101v2_u009_v00_hd.mp4"}' + 		
										"]' " + 								
										'data-transcript="/player/getfile.ashx?file=CE101v2/Transcripts/en-US/CE101v2_u009_v002_transcript.xml" ' + 
										'data-slidesvideo="https://d16d701c6pwcqb.cloudfront.net/ce101v2/CE101v2_u009_v002_ppt.mp4">CE101v2</span>' + 
								
								'<span data-video="https://d16d701c6pwcqb.cloudfront.net/st102/ST102_u003_v002.mp4" ' +
										"data-videos='[" +
											//'{"quality":"360p","url":"https://d16d701c6pwcqb.cloudfront.net/st102/ST102_u003_v002_lo.mp4"},' + 
											'{"quality":"480p","url":"https://d16d701c6pwcqb.cloudfront.net/st102/ST102_u003_v002.mp4"}' + 
										"]' " +								 
										'data-transcript="/player/getfile.ashx?file=st102/Transcripts/zh-CN/st102_u003_v002_transcript.xml" ' + 
										'data-slidesvideo="" ' + 
										'data-slidesdata="/player/getfile.ashx?file=st102/Slides/zh-CN/st102_u003_v002_slides.xml" ' + 
										'data-slidespath="/player/getfile.ashx?file=st102/Slides/zh-CN/" ' + 
										'>ST102 4:3 CN</span>' + 
										
								'<span data-video="https://d16d701c6pwcqb.cloudfront.net/st106/ST106_u002_v001.mp4" ' + 
										"data-videos='[" +
											'{"quality":"360p","url":"https://d16d701c6pwcqb.cloudfront.net/st106/ST106_u002_v001_lo.mp4"},' + 
											'{"quality":"480p","url":"https://d16d701c6pwcqb.cloudfront.net/st106/ST106_u002_v001.mp4"}' + 
										"]' " +							
										'data-transcript="/player/getfile.ashx?file=st106/Transcripts/en-US/st106_u002_v001_transcript.xml" ' + 
										'data-slidesvideo="" ' + 
										'data-slidesdata="/player/getfile.ashx?file=st106/Slides/en-US/st106_u002_v001_slides.xml" ' + 
										'data-slidespath="/player/getfile.ashx?file=st106/Slides/en-US/" ' + 
										'>ST106 16:9</span>' + 																		
								
						'</div>')
							.appendTo(self.headerNavigation)
							.on('click', 'span', function() {  
								var node = $(this);
								
								
								self.loadCourse( JSON.parse(node.attr('data-videos')), node.attr('data-transcript'), node.attr('data-slidesvideo'), node.attr('data-slidesdata'), node.attr('data-slidespath') )
								
								
								
							});
		
			
	};

});

