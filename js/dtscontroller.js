var DtsCoursesController = function (id, player, baseVideoUrl, baseContentUrl, userCourses, courseInfoUrlCallback, currentTimeUrl, playerProgressUrl, defaultQualities) {
	this.id = id;
	this.baseVideoUrl = baseVideoUrl;
	this.baseContentUrl = baseContentUrl;
	this.userCourses = userCourses;
	this.courseInfoUrlCallback = courseInfoUrlCallback;
	this.currentTimeUrl = currentTimeUrl;
	this.playerProgressUrl = playerProgressUrl;
	this.player = player;
	this.defaultQualities = defaultQualities;
	
	this.defaultLanguages = {
		"en-US": { "name": "English", "englishName": "English", "dir": 'ltr' },
		"zh-TW": { "name": "漢語(繁體字)t", "englishName": "Traditional Chinese", "dir": 'ltr' },
		"zh-CN": { "name": "汉语(简体字)s", "englishName": "Simplified Chinese", "dir": 'ltr' }
	};
	this.qualitySuffixes = {'360p': '_lo', '480p': '', '720p': '_hd'};
	
	this.courseInfoData = [];		
	this.loadingInfo = {};
	this.currentCourseData = null;
	
	this.init();	
}

DtsCoursesController.prototype = {
	init: function() {
		var self = this;
		
		// create notes
		self.container = $('#' + self.id);
		self.headerNavigation = self.container.find('.player-header-navigation');
		self.courseList = $('<select class="course-list"></select>').appendTo(self.headerNavigation);
		self.unitList = $('<select class="unit-list"></select>').appendTo(self.headerNavigation);
		self.videoList = $('<select class="video-list"></select>').appendTo(self.headerNavigation);
		self.languageList = $('<select class="langauge-list"></select>').appendTo(self.headerNavigation);
								
		// setup events	
		self.courseList.on('change', $.proxy(self.handleCourseChange, self));
		self.unitList.on('change', $.proxy(self.handleUnitChange, self));
		self.videoList.on('change', $.proxy(self.handleVideoChange, self));
		self.languageList.on('change', $.proxy(self.handleLanguageChange, self));								
						
		// connect player events
		self.setupPlayerEvents();				
						
		// create/fill data					
		self.populateLanguages();
		self.loadCoursesData();		
	},
	
	setupPlayerEvents: function() {
		var self = this,
			playingInterval = null;
						
		function startInterval() {
			stopInterval();
			playingInterval = setInterval(function() {
				self.reportVideo('progress');				
			}, 5000);
		}
		function stopInterval() {
			clearInterval(playingInterval);
		}			
		
		self.player.mainVideo.on('play', function() {
			startInterval();
			self.reportVideo('start');
		});
		self.player.mainVideo.on('pause', function() {
			stopInterval();
		});		
		self.player.mainVideo.on('ended', function() {
			stopInterval();
			self.reportVideo('ended');
		});
		
		
		self.player.mainAudio.on('play', function() {
			startInterval();
			self.reportVideo('start');
		});
		self.player.mainAudio.on('pause', function() {
			stopInterval();
		});		
		self.player.mainAudio.on('ended', function() {
			stopInterval();
			self.reportVideo('ended');
		});		
	},
	
	reportVideo: function(eventName) {
		var self = this;	
		
		if (self.playerProgressUrl != '') {
			$.ajax({
				type: 'GET',
				//url: 'dts-courses-list.xml',
				url: self.playerProgressUrl, 
				data: {
					event: eventName,
					
					course: self.getSelectedCourse(),
					unit: self.getSelectedUnit(),
					video: self.getSelectedVideo(),
					language: self.getSelectedLanguage(),	
																
					time: self.player.mainMediaNode.currentTime,
					
					arrangement: $('.player-arrangements-setting').val(),
					speed: parseFloat($('.player-speed-setting').val()),
					quality: $('.player-quality-setting').val()								
								
				},
				success: function (data) {
					
				
				},
				error: function (e) {
					console.log('ERROR: progress reporting', e);
				}
			});		
		}
	},

	// DROPDOWN EVENTS
	handleCourseChange: function(e) {
		var self = this;
				
		self.loadLanguagesForCourse();
		self.loadUnits();
	},
	
	handleUnitChange: function(e) {
		var self = this;
				
		self.loadVideos();
	},	
	
	handleVideoChange: function(e) {
		var self = this;
				
		self.loadSelectedCourse();
	},	
	
	handleLanguageChange: function(e) {
		var self = this;

		self.unitList.html('');
		self.unitList.attr('disabled', 'disabled');
		self.videoList.html('');
		self.videoList.attr('disabled', 'disabled');		
		
		self.loadCoursesByLanguage();	
	},			
	
	
	// MAIN LOADING
	populateLanguages: function() {
		var self = this,
			html = '';

		for (var languageCode in self.defaultLanguages) {
			html += '<option value="' + languageCode + '">' + self.defaultLanguages[languageCode].name + '</option>';
		}
		self.languageList.html(html);
	},

	loadCoursesData: function() {
		
		var self = this;
		
		self.courseList.attr('disabled', 'disabled');
		self.courseList.html('<option>Loading...</option>');
		self.unitList.attr('disabled', 'disabled');
		self.videoList.attr('disabled', 'disabled');

		$.ajax({
			type: 'GET',
			//url: 'dts-courses-list.xml',
			dataType: 'json',
			url: self.userCourses + document.location.search,
			success: function (data) {

				self.courseInfoData = data;

				// fill in the main dropdownlist
				self.loadCoursesByLanguage();
				
				// see if the URL has loading data
				self.loadCourseFromHash();
			},
			error: function (e) {
				
				if (window.location.href.indexOf('file:') > -1) {
					var html = '<h2>Local files error</h2><p>Please use IE, Safari, or Firefox.</p><p>To use Chrome, enter the following command';			
					var ua = navigator.userAgent.toLowerCase();
					
					if (ua.indexOf('mac') > -1) {
						html +=
							'<p>Mac, Terminal</p>' +
							'<code>/Applications/Google\\ Chrome.app/Contents/MacOS/Google\\ Chrome --allow-file-access-from-files</code>';
					} else
					if (ua.indexOf('windows') > -1) {
						html +=
							'<p>Windows, Command Prompt</p>' +
							'<code>%localappdata%\google\chrome\application\chrome --allow-file-access-from-files</code>';
					}					
										
					self.player.showMessage(html);
					
				}
				
				console.log('ERROR:loadCouresData', e);
			}
		});
	},
	
	loadCoursesByLanguage: function() {
		var self = this,
			language = self.getSelectedLanguage(),
			versionRegEx = /v\d/gi,
			html = '';
			
		for (var i=0, il=self.courseInfoData.length; i<il; i++) {
			var course = self.courseInfoData[i];
		
			// see if course has this language, if so add it to the list
			for (var j = 0, jl= course.languages.length; j < jl; j++) {
				if (course.languages[j].lang == language) {
					html += '<option value="' + course.code.toLowerCase() + '">' + course.code.replace(versionRegEx, '') + ': ' + course.languages[j].name + (versionRegEx.test(course.code) ? ' (' +  course.code.match(/v\d/gi) + ')' : '') + (course.languages[j].isVideoSlides ? ' [vs]' : '') + '</option>'; ;
				}
			}
		}

		self.courseList.prop('disabled', false);
		self.courseList.html('<option value="">--Select--</option>' + html);
	},
	
	
	loadLanguagesForCourse: function() {
		var self = this,
			language = self.getSelectedLanguage(),
			courseCode = self.getSelectedCourse();
		
		if (courseCode == '') {
			//loadAllLanguages();
		} else {
			var courseInfo = self.getCourseInfo(courseCode);

			var html = '';
			for (var i = 0; i < courseInfo.languages.length; i++) {
						
				if (typeof self.defaultLanguages[courseInfo.languages[i].lang] != 'undefined') {
					html += '<option value="' + courseInfo.languages[i].lang + '">' + self.defaultLanguages[courseInfo.languages[i].lang].name + '</option>';
				}
			}
			self.languageList.html(html);
		}

		// attempt to reselect the same one
		self.languageList.val(language);
	},
	
	loadCourseFromHash: function () {
		var self = this,
			hashValues = self.parseTokens(document.location.hash);
			
		hashValues.autoplay = true;
			
		self.fillCourseInfo(hashValues);
	},
	
	fillCourseInfo: function(info) {
		
		var self = this;
		
		self.loadingInfo = info;

		// language
		if (typeof (self.loadingInfo.language) != 'undefined') {
			self.languageList.val(self.loadingInfo.language);
			self.setLanguage();
		}

		// select course
		if (typeof (self.loadingInfo.course) != 'undefined') {

			// check of there is an option with the exact value
			
			if (self.courseList.find('option[value="' + self.loadingInfo.course.toLowerCase() + '"]').length > 1) {
				self.courseList.val( self.loadingInfo.course.toLowerCase() );
			} else {
				
				// if ST101, but that's not availble, choose the closest one (ST101v2)				
				// look for BE101 in the <option>s and then use that to select BE101v2				
				self.courseList.val( self.courseList.find('option[value*="' + self.loadingInfo.course.toLowerCase() + '"]').attr('value') );
			}

			self.loadUnits();
		}

		// TODO: the rest of the class
	},

	updateBrowserLocation: function () {
		var self = this;
		
		document.location.hash = self.tokensToString({ 
			course: self.courseList.val(), 
			unit: self.unitList.val(), 
			video: self.videoList.val(), 
			language: self.languageList.val() 
		});
	},

	setLanguage: function () {

		var self = this,
			language = self.getSelectedLanguage();

		$('body').attr('lang', language);
		//$('.transcript').attr('dir', defaultLanguages[lang].dir);
	},

	loadUnits: function () {

		var self = this,
			language = self.getSelectedLanguage(),
			courseCode = self.getSelectedCourse();
						
		if (courseCode != '' && language != '') {
			
			self.courseList.attr('disabled', 'disabled');
			self.unitList.html('<option>Loading...</option>');
			self.unitList.attr('disabled', 'disabled');
			self.videoList.html('<option>Loading...</option>');
			self.videoList.attr('disabled', 'disabled');				
						
			var url = self.getCourseInfoUrl(courseCode, language);

			$.ajax({
				url: url,
				dataType: 'json',
				success: function (data) {

					self.currentCourseData = data;

					// reenable the course list
					self.courseList.prop('disabled', false);

					// now fill the unit list
					var html = '';
					for (var i=0, il=self.currentCourseData.length; i<il; i++) {
						
						var unit = self.currentCourseData[i];
						
						if (unit.isActive || unit.number == self.loadingInfo.unit) {							
							html += '<option value="' + unit.number + '">' + unit.number.toString() + '. ' + unit.name + '</option>';
						}
					}
					self.unitList.html('<option value="">--Select--</option>' + html);
					self.unitList.prop('disabled', false);

					//if (isSwitchingLanguage || isLoadingFromHash) {
					if (typeof self.loadingInfo.unit != 'undefined' && self.loadingInfo.unit > 0) {
						// select the same unit
						self.unitList.val(self.loadingInfo.unit);

						// do the next step
						self.loadVideos();
					}

				},
				error: function (e) {				
					alert('There was an error loading this classes units and video ' + url + ' ' + e);
				}
			});
		}
	},

	loadVideos: function () {
		var self = this,
			unitNumber = self.getSelectedUnit(),
			unitInfo = self.currentCourseData[unitNumber - 1];
		
		if (typeof unitInfo == 'undefined') {
			return;
		}

		//console.log('unit changed', selectedUnit, selectedUnit.videos);

		// now fill the video list
		var html = '';
		for (var i=0, il = unitInfo.videos.length; i<il; i++) {
			var video = unitInfo.videos[i];
			
			//console.log(videoNumber);
			if (video.isActive || video.number == self.loadingInfo.video) {
				html += '<option value="' + video.number + '">' + video.number.toString() + '. ' + video.name + ' (' + video.speaker + ') ' + video.duration.substring(3, video.duration.indexOf('.')) + '</option>';
			}
		}
		self.videoList.html('<option value="">--Select--</option>' + html);
		self.videoList.prop('disabled', false);

		//if (isSwitchingLanguage || isLoadingFromHash) {
		if (typeof self.loadingInfo.video != 'undefined' && self.loadingInfo.video > 0) {

			// select the video
			self.videoList.val(self.loadingInfo.video );

			// begin playing
			if (self.loadingInfo.autoplay === true) {		
				self.loadSelectedCourse(self.loadingInfo.start);
				
				// kill loading info
				self.loadingInfo = {};
			}
			
			self.updateBrowserLocation();			
		}
	},

	loadSelectedCourse: function (startTime) {
		var 
			self = this,
			courseCode = self.getSelectedCourse(),
			language = self.getSelectedLanguage(),
			unitNumber = self.getSelectedUnit(),
			videoNumber = self.getSelectedVideo();
			
			
		if (typeof startTime == 'undefined' && self.currentTimeUrl != '') {
			startTime = 0;
			
			$.ajax({
				type: 'GET',
				url: self.currentTimeUrl,
				data:
					 'course=' + courseCode + '&' +
					 'unit=' + unitNumber + '&' +
					 'video=' + videoNumber + '&',
				success: function (data) {
					
					startTime = data.time;
					
					self.sendCourseToPlayer(language, courseCode, unitNumber, videoNumber, startTime);					
					
				},
				error: function (xhr) {
					console.log('error', xhr);
				}
			});			
			
			
		} else {
			self.sendCourseToPlayer(language, courseCode, unitNumber, videoNumber, startTime);
		}
	},
	
	loadNext: function() {
		var 
			self = this,
			courseCode = self.getSelectedCourse(),
			language = self.getSelectedLanguage(),
			unitNumber = self.getSelectedUnit(),
			videoNumber = self.getSelectedVideo(),
			courseData = self.currentCourseData,
			foundNextVideo = false;
		
		
		var unitInfo = courseData.filter(function(unit) { return unit.number == unitNumber});
		if (unitInfo.length > 0) {
			unitInfo = unitInfo[0];
		}
		
		// attempt to find the next active video
		var videoInfo = unitInfo.videos.filter(function(video) { return video.number == videoNumber});
		if (videoInfo.length > 0) {
			videoInfo = videoInfo[0];
		}
		var videoIndex = unitInfo.videos.indexOf(videoInfo);
		
		videoIndex++;
		while (videoIndex < unitInfo.videos.length) {
			videoInfo = unitInfo.videos[videoIndex];
			if (videoInfo.isActive) {
				videoNumber = videoInfo.number;
				foundNextVideo = true;
				break;
			}
			videoIndex++;
		}	
		
		if (!foundNextVideo) {
			// next unit?
			var unitIndex = courseData.indexOf(unitInfo);
			unitIndex++;
			while (unitIndex < courseData.length) {
				unitInfo = courseData[unitIndex];
				if (unitInfo.isActive) {
					unitNumber = unitInfo.number;
					
					// find first active video!?
					for (var i=0, il=unitInfo.videos.length; i<il; i++) {
						videoInfo = unitInfo.videos[i];
						
						if (videoInfo.isActive) {							
							videoNumber = videoInfo.number;
							foundNextVideo = true;	
							break;	
						}				
					}
					
				}
				if (foundNextVideo) {
					break;
				}
				unitIndex++;
			}			
		}
		
		console.log(foundNextVideo, courseCode, unitNumber, videoNumber);
		
		if (foundNextVideo) {
			self.sendCourseToPlayer(language, courseCode, unitNumber, videoNumber, 0);		
			
			self.fillCourseInfo({
				language: language, 
				course: courseCode, 
				unit: unitNumber, 
				video: videoNumber, 
				start: 0
			});				
		}
		
		return foundNextVideo;
	},
	
	sendCourseToPlayer: function (language, courseCode, unitNumber, videoNumber, startTime) {

		if (typeof startTime == 'undefined') {
			startTime = 0;
		}
		
		var self = this,
			qualities = self.defaultQualities.slice(),
			courseInfo = self.getCourseInfo(courseCode, language),
			unitInfo = self.currentCourseData.filter(function(unit) { return unit.number == unitNumber; })[0],
			videoInfo = unitInfo.videos.filter(function(video) { return video.number == videoNumber; })[0];			
		
		if (courseInfo.isHdVideo) {
			qualities.push('720p');
		}

		// STUFF TO PLAY
		var
			baseCourseFile = courseCode.toUpperCase().replace('V','v') + '_u' + (unitNumber < 100 ? '0' : '') + (unitNumber < 10 ? '0' : '') + unitNumber.toString() + '_v' + (videoNumber < 100 ? '0' : '') + (videoNumber < 10 ? '0' : '') + videoNumber.toString(),
			
			transcriptUrl = self.baseContentUrl + courseCode.toLowerCase() + '/Transcripts/' + language + '/' + baseCourseFile + '_transcript.xml',
			slideImagesPath = courseInfo.isVideoSlides ? '' : self.baseContentUrl + courseCode.toLowerCase() + '/Slides/' + language + '/',
			slidesDataUrl = courseInfo.isVideoSlides ? '' : slideImagesPath + baseCourseFile + '_slides.xml',
			slidesVideoUrl = courseInfo.isVideoSlides ? self.baseVideoUrl + courseCode.toLowerCase() + '/' + baseCourseFile + '_ppt.mp4' : '',
			
			combinedVideoUrl = courseInfo.isVideoSlides ? self.baseVideoUrl + courseCode.toLowerCase() + '/' + baseCourseFile + '_combined.mp4' : '',
			
			audioUrl = self.baseVideoUrl + courseCode.toLowerCase() + '/' + baseCourseFile + '.mp3',
			mainVideoUrls = [];
			
			
		if (videoInfo.hasSlides == false) {
			slidesVideoUrl = '';
			slidesDataUrl = '';			
			slideImagesPath = '';						
		}
		

		for (var i=0,il=qualities.length; i<il; i++) {
			mainVideoUrls.push({
				url:  self.baseVideoUrl + courseCode.toLowerCase() + '/' + baseCourseFile + self.qualitySuffixes[qualities[i]] + '.mp4',
				quality: qualities[i]				
			});
		}
		
		
		// STUFF TO DOWNOAD
		var videoDownloads = [];
		for (var i=0, il=mainVideoUrls.length; i<il; i++) {
			videoDownloads.push({
				title: mainVideoUrls[i].quality,
				url: 'download.ashx?' + 
					'url=' + mainVideoUrls[i].url +
					'&course=' + courseCode +
					'&unit=' + unitNumber +
					'&video=' + videoNumber +
					'&type=' + mainVideoUrls[i].quality +					
					'&source=player' 
			});
		}
		videoDownloads.push({
			title: 'MP3',
			url: 'download.ashx?' + 
					'url=' + audioUrl +
					'&course=' + courseCode +
					'&unit=' + unitNumber +
					'&video=' + videoNumber +
					'&type=audio' +					
					'&source=player' 
		});

		
		var transcriptDownloads = [
			{
				title: 'Print',
				url: 'print-transcript.aspx?language=' + language + '&course=' + courseCode + '&unit=' + unitNumber + '&video=' + videoNumber
			}
		];
		
		var slideDownloads = [
			{
				title: 'Print',
				url: 'print-slides.aspx?language=' + language + '&course=' + courseCode + '&unit=' + unitNumber + '&video=' + videoNumber
			}
		];	
		
		
		if (courseInfo.isVideoSlides) {
			slideDownloads.push({
				title: 'Video+Slides',
				url: 'download.ashx?' + 
					'url=' + combinedVideoUrl +
					'&course=' + courseCode +
					'&unit=' + unitNumber +
					'&video=' + videoNumber +
					'&type=' + 'combined' +					
					'&source=player' 
			});			
		}		
		
		
		// HACKY CODE
		if (courseCode == 'BE101v3' && !(unitNumber == 1 && videoNumber == 2)) {
			$('.player-slidesvideo-container').addClass('force_4_3');
		} else {
			$('.player-slidesvideo-container').removeClass('force_4_3');			
		}
		

		// START PLAYING		
		player.loadCourse(mainVideoUrls, audioUrl, transcriptUrl, slidesVideoUrl, slidesDataUrl, slideImagesPath, startTime);			
		player.setDownloads(videoDownloads, transcriptDownloads, slideDownloads);
		player.setSearchInfo('search.ashx?course=' + courseCode + '&language=' + language, self.searchCallback);
		
		
		// update URL for snazzy users
		self.updateBrowserLocation();
	},
	
	
	// UTILITY METHODS
	parseTokens: function(input) {
		var tokens = {},
			parts = input.replace('#', '').split('&');
			
		for (var i in parts) {
			var p = parts[i].split('=');
			tokens[p[0]] = p[1];
		}
		
		return tokens;
	},

	// {class: 'be1o1', unit: 1} ==> class=be101&unit=1
	tokensToString: function (tokens) {
		var parts = [];
		for (var i in tokens) {
			parts.push(i + '=' + tokens[i]);
		}
		return parts.join('&');
	},

	getCourseInfoUrl: function(courseCode, language) {	
		return this.courseInfoUrlCallback(courseCode, language);			
	},		

	getSelectedLanguage: function() {
		return this.languageList.val();
	},

	getSelectedCourse: function () {
		return this.courseList.val();
	},
	
	getCourseInfo: function (courseCode, language) {
		var courseInfo = this.courseInfoData.filter(function(c) {
			return c.code.toLowerCase() == courseCode.toLowerCase();
		})[0];
		
		if (typeof language != 'undefined') {
			courseInfo = courseInfo.languages.filter(function(c) { return c.lang == language; })[0];				
		}
		
		return courseInfo;
	},		

	getSelectedUnit: function () {
		return parseInt(this.unitList.val(), 10);
	},

	getSelectedVideo: function () {
		return parseInt(this.videoList.val(), 10);
	},	
	
	
	// PUBLIC METHODS
	
	getSearchUrl: function() {
		var self = this,
			courseCode = self.getSelectedCourse(),
			language = self.getSelectedLanguage();
			
		if (courseCode == 'Loading...') {
			courseCode = '';
		}		
		
		return 'search.ashx?course=' + courseCode + '&language=' + language;
	},
	
	searchCallback: function(searchData) {
	
		var self = this;

		self.sendCourseToPlayer(searchData.language, searchData.courseCode, searchData.unitNumber, searchData.videoNumber, searchData.seconds);		

		self.fillCourseInfo({
			language: searchData.language, 
			course: searchData.courseCode, 
			unit: searchData.unitNumber, 
			video: searchData.videoNumber, 
			start: searchData.seconds
		});		
	},
	
	sendFeedback: function (feedbackType, feedbackText, videoUrl, time, transcript) {
		
		var self = this,
			course = self.getSelectedCourse(),
			unitNumber = self.getSelectedUnit(),
			videoNumber = self.getSelectedVideo();
		
		$.ajax({
			type: 'POST',
			url: 'player-feedback.ashx',
			data:
				 'type=' + feedbackType + '&' +
				 'course=' + course + '&' +
				 'unit=' + unitNumber + '&' +
				 'video=' + videoNumber + '&' +				 				 					 
				 'time=' + time + '&' +
				 'videoUrl=' + videoUrl + '&' +					 
				 'transcript=' + transcript + '&' +
				 'text=' + feedbackText + '',
			success: function (xhr) {
				
			},
			error: function (xhr) {
				console.log('error', xhr);
			}
		});
	}		
}