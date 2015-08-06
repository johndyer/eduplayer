var Player = function(id) {
	this.id = id;
	this.init();
}

Player.prototype = {

	isScrubbing: false,

	init: function() {

		var self = this;

		self.win = $(window);
		self.settings = {
			separation: 10,
			arrangement: self.getValue('player-setting-arrangement', 'largeslides'),
			transcript: self.getValue('player-setting-transcript', 'show'),
			speed: self.getValue('player-setting-speed', '1.0'),
			quality: self.getValue('player-setting-quality', '480p')
		};

		self.controller = null;

		// MAIN NODES
		self.container = container = $('#' + self.id);
		self.header = $('<div class="player-header"></div>').appendTo(self.container);
		self.headerButtons = $('<div class="player-header-buttons"></div>').appendTo(self.header);
		self.headerNavigation = $('<div class="player-header-navigation"></div>').appendTo(self.header);

		// CONTENT
		self.mainVideoContainer = $('<div class="player-mainvideo-container"></div>').appendTo(self.container);
		self.mainVideo = $('<video class="player-mainvideo"></video>').appendTo(self.mainVideoContainer);
		self.mainVideoNode = self.mainVideo[0];

		self.slideVideoContainer = $('<div class="player-slidesvideo-container"></div>').appendTo(self.container);
		self.slideVideo = $('<video class="player-slidesvideo"></video>').appendTo(self.slideVideoContainer);
		self.slideVideoNode = self.slideVideo[0];

		self.mainAudio = $('<audio class="player-mainaudio"></audio>').appendTo(self.container);
		self.mainAudioNode = self.mainAudio[0];

		self.mainMedia = self.mainVideo;
		self.mainMediaNode = self.mainVideoNode;


		self.mainVideo.on('canplay loadeddata loadedmetadata', function() {
			console.log('setting speed',self.settings.speed )
			self.mainVideoNode.playbackRate = parseFloat(self.settings.speed);
			self.slideVideoNode.playbackRate = parseFloat(self.settings.speed);
			self.resizePlayer();
		});

		self.slideVideo.on('canplay loadeddata loadedmetadata', function() {
			self.mainVideoNode.playbackRate = parseFloat(self.settings.speed);
			self.mainAudioNode.playbackRate = parseFloat(self.settings.speed);
			self.slideVideoNode.playbackRate = parseFloat(self.settings.speed);
			self.resizePlayer();
		});

		self.mainAudio.on('canplay loadeddata loadedmetadata', function() {
			self.mainAudioNode.playbackRate = parseFloat(self.settings.speed);
			self.slideVideoNode.playbackRate = parseFloat(self.settings.speed);
			self.resizePlayer();
		});


		self.createEnded();
		self.createTranscript();
		self.createSlides();

		self.controllerBar = $('<div class="player-controller"></div>').appendTo(self.container);
		self.controllerButtons = $('<div class="player-controller-buttons"></div>').appendTo(self.controllerBar);

		// DATA
		self.transcriptData = null;
		self.slidesData = null;

		// add features
		var features = ['logo', 'play', 'fullscreen', 'timeline', 'current', 'duration',
			'volume', 'settings', 'download', 'search', 'feedback'];

		for (var i=0, il=features.length; i<il; i++) {
			var featureName = features[i];
			this['build' + featureName ]();

			//console.log('creating',featureName);
		}

		self.reset();


		self.win.on('resize orientationchange', jQuery.proxy(self.resizePlayer, self));
		//self.win.on('resize', jQuery.proxy(self.resizePlayer, self));

		setTimeout(function() {
			self.resizePlayer();
		}, 10);
	},

	getValue: function(key, defaultValue) {
		var self = this,
			value = localStorage.getItem(key);

		if (value == null || typeof value == 'undefined') {
			self.setValue(key, defaultValue);
			return defaultValue;
		} else {
			return value;
		}
	},

	setValue: function(key, value) {
		try {
			localStorage.setItem(key, value);
		} catch (e) {
			console.log('local storage error', key, value);
		}
	},

	reset: function() {

		var self = this;

		self.container.trigger('player.reset');

		self.transcriptData = null;
		self.slidesData = null;

		self.mainVideoNode.pause();
		self.mainVideoNode.src = '';
		self.mainAudioNode.pause();
		self.mainAudioNode.src = '';

		self.slidesContainer.hide();
		self.slideVideo.show();
	},

	buildlogo: function() {
		var self = this,
			logo = $('<a href="http://www.dts.edu/" class="player-logo"></a>')
				.appendTo(self.header);
	},

	buildplay: function() {
		var self = this,
			playButton = $('<button class="player-button player-play-pause" value="Play" ></button>')
				.appendTo(self.controllerBar),
			mainVideo = self.mainVideo,
			mainAudio = self.mainAudio;

		self.playButton = playButton;


		mainVideo.on('play', function(e) {
			playButton.addClass('playing');
		});
		mainVideo.on('pause', function(e) {
			playButton.removeClass('playing');
		});


		mainAudio.on('play', function(e) {
			playButton.addClass('playing');
		});

		mainAudio.on('pause', function(e) {
			playButton.removeClass('playing');
		});

		// CONTROLS
		playButton.on('click', handlePlayClick);
		mainVideo.on('click', handlePlayClick);

		function handlePlayClick(e) {

			if (self.mainMediaNode.paused) {
				self.mainMediaNode.play();
				//self.slideVideoNode.play();
			} else {
				self.mainMediaNode.pause();
				//self.slideVideoNode.pause();
			}
		}

		self.container.on('player.reset', function() {
			playButton.removeClass('playing');
		});
	},


	buildvolume: function() {
		var self = this,
			doc = $(document),
			muteButton = $('<button class="player-button player-mute-toggle" value="Mute" ></button>')
				.appendTo(self.controllerBar),

			volumeOuter = $('<div class="player-volume-outer"></div>').appendTo(self.controllerBar),
			volumeInner = $('<div class="player-volume-inner"></div>').appendTo(volumeOuter),
			volumeHandle = $('<div class="player-volume-handle"></div>').appendTo(volumeOuter);

			mainVideo = self.mainVideo,
			mainVideoNode = self.mainVideoNode,

			preMuteVolume = -1;


		if (Detection.isiOS) {
			muteButton.hide();
			volumeOuter.hide();
		}


		muteButton.on('click', function() {

			console.log('mute.click', mainVideoNode.volume,  mainVideoNode.muted);

			if (mainVideoNode.volume > 0 || mainVideoNode.muted == false) {


				preMuteVolume = mainVideoNode.volume;
				mainVideoNode.muted = true;
				mainVideoNode.volume = 0;

				mainAudioNode.muted = true;
				mainAudioNode.volume = 0;

			} else {

				mainVideoNode.muted = false;

				if (preMuteVolume > 0) {
					mainVideoNode.volume = preMuteVolume;
					mainAudioNode.volume = preMuteVolume
				} else {
					mainVideoNode.volume = 1;
					mainAudioNode.volume = 1;
				}
			}
		});


		var isMouseDown = false;

		volumeOuter.on('mousedown touchstart', handleMouseDown);

		function handleMouseDown(e) {

			console.log(e.type);

			adjustVolume(e);

			doc.on('mouseup touchend', handleMouseUp);
			doc.on('mousemove touchmove', handleMouseMove);
		}

		function handleMouseUp(e) {

			doc.off('mouseup touchend', handleMouseUp);
			doc.off('mousemove touchmove', handleMouseMove);
		}

		function handleMouseMove(e) {
			console.log(e.type);

			adjustVolume(e);
		}

		function adjustVolume(e) {
			var width = volumeOuter.width(),
				x = e.pageX - volumeOuter.offset().left;

			if (x < 0) {
				x = 0;
			} else if (x > width) {
				x = width;
			}

			var	percent = x/width;

			mainVideoNode.volume = percent;
			mainAudioNode.volume = percent;

			volumeInner.css({ width: (percent*100) + '%' });
			volumeHandle.css({ left: (percent*100) + '%' });
		}


		mainVideo.on('volumechange', function(e) {

			if (self.mainMediaNode.volume == 0 || self.mainMediaNode.muted === true) {
				muteButton.addClass('muted');
			} else {
				muteButton.removeClass('muted');
			}

			volumeInner.css({ width: (self.mainMediaNode.volume*100) + '%' });
			volumeHandle.css({ left: (self.mainMediaNode.volume*100) + '%' });

		});
	},


	buildfullscreen: function() {

		var self = this,
			fullscreenButton = $('<button class="player-button player-fullscreen-button">Fullscreen</button>')
				.appendTo(self.controllerButtons);

		if (document.fullscreenEnabled ||  document.webkitFullscreenEnabled || document.mozFullScreenEnabled || document.msFullscreenEnabled) {
			var isFullscreen = false;

			fullscreenButton.on('click', function() {

				if (isFullscreen) {
					exitFullscreen();
				} else {
					enterFullscreen();
				}

			});

			function enterFullscreen() {

				var player = container[0];

				if (player.requestFullscreen) {
				    player.requestFullscreen();
				} else if (player.webkitRequestFullscreen) {
				    player.webkitRequestFullscreen();
				} else if (player.mozRequestFullScreen) {
				    player.mozRequestFullScreen();
				} else if (player.msRequestFullscreen) {
				    player.msRequestFullscreen();
				}

			}

			function exitFullscreen() {

				if (document.exitFullscreen) {
				    document.exitFullscreen();
				} else if (document.webkitExitFullscreen) {
				    document.webkitExitFullscreen();
				} else if (document.mozCancelFullScreen) {
				    document.mozCancelFullScreen();
				} else if (document.msExitFullscreen) {
				    document.msExitFullscreen();
				}

			}


			function fullscreenHandler(e) {

				isFullscreen = document.fullScreen || document.mozFullScreen || document.webkitIsFullScreen;

				console.log('fullscreenevent', isFullscreen, e);

				if (isFullscreen) {
					self.container.addClass('player-is-fullscreen');
				} else {
					self.container.removeClass('player-is-fullscreen');
				}

				self.resizePlayer();
			}

			document.addEventListener("fullscreenchange", fullscreenHandler);
			document.addEventListener("webkitfullscreenchange", fullscreenHandler);
			document.addEventListener("mozfullscreenchange", fullscreenHandler);
			document.addEventListener("MSFullscreenChange", fullscreenHandler);


		} else {
			fullscreenButton.hide();
		}
	},

	buildsettings: function() {

		var self = this,
			settingsButton = $('<button class="player-button player-settings-button">Settings</button>')
				.appendTo(self.controllerButtons),
			settingsPanel = $('<div class="player-settings-panel player-panel"></div>')
				.appendTo(self.container).hide(),
			settingsTimeout = null;


		function startSettingsTimeout() {
			clearSettingsTimeout();
			settingsTimeout = setTimeout(settingsOff, 3500);
		}

		function clearSettingsTimeout() {
			if (settingsTimeout != null) {
				clearTimeout(settingsTimeout);
			}
			settingsTimeout = null;
		}
		function settingsOff() {
			settingsPanel.hide();
		}


		// MAIN SETTINGS
		settingsButton.on('click', function() {
			if (settingsPanel.is(':visible')) {
				settingsPanel.hide();
			} else {
				settingsPanel.show();
				settingsPanel.css({
					right: 	self.settings.separation,
					bottom: self.controllerBar.outerHeight(true) + self.settings.separation,
				});

				startSettingsTimeout();
			}
		});

		self.container.find('.player-settings-button, .player-settings-panel')
				.on('mouseover', function() {
					clearSettingsTimeout();
				})
				.on('mouseout', function() {
					startSettingsTimeout();
				});





		self.container.on('click', function(e) {
			var target = $(e.target),
				clickedOnThis = false;

			// go through all nested clicked elements
			while (target != null && target.length > 0) {

				if (target[0] == settingsButton[0] || target[0] == settingsPanel[0]) {
					clickedOnThis = true;
					break;
				}

				target = target.parent();
			}

			if (!clickedOnThis) {
				settingsPanel.hide();
			}
		});


		// ORIENTATION
		var arrangmentSetting = $('<div class="player-setting">' +
										'<label for="">Arrangement</label>' +
										'<select class="player-arrangements-setting">' +
											'<option value="largevideo">Large Video</option>' +
											'<option value="largeslides">Large Slides</option>' +
											'<option value="equal">Side-by-side</option>' +
											'<option value="stacked">Stacked</option>' +
											'<option value="audio">Audio Only</option>' +
										'</select>' +
									'</div>')
									.appendTo(settingsPanel);

		arrangmentSetting.find('option[value="' + self.settings.arrangement + '"]').prop('selected', true);

		arrangmentSetting.on('change', 'select', function() {

			var
				oldValue = self.settings.arrangement,
				newValue = $(this).val();
			self.settings.arrangement = newValue;
			self.setValue('player-setting-arrangement', newValue );

			if (newValue == 'audio' || oldValue == 'audio') {
				self.reload();
			} else {
				self.resizePlayer();
			}
		});


		if (Detection.isiPhone) {
			self.settings.arrangement = 'audio';
			arrangmentSetting
					.find('option[value="audio"]')
					.prop('selected', true)
					.siblings()
						.remove();
			self.resizePlayer();
		}


		// Transcript
		var transcriptSetting =
							$('<div class="player-setting">' +
								'<label for="">Transcript</label>' +
								'<select class="player-transcript-setting">' +
									'<option value="show" selected="">Show</option>' +
									'<option value="hide" >Hide</option>' +
								'</select>' +
							'</div>')
							.appendTo(settingsPanel);


		transcriptSetting.find('option[value="' + self.settings.transcript + '"]').prop('selected', true);
		self.transcript[ self.settings.transcript ]();

		transcriptSetting.on('change', 'select', function() {

			var newValue = $(this).val();
			self.settings.arrangement = newValue;
			self.setValue('player-setting-transcript', newValue );

			if (newValue == 'show') {
				self.transcript.show();
				//self.adjustTranscriptSize();
				self.resizePlayer();
			} else {
				self.transcript.hide();
			}

		});


		// Speed
		var speedSetting =
							$('<div class="player-setting">' +
								'<label for="">Speed</label>' +
								'<select class="player-speed-setting">' +
									'<option value="2.0">2.0x</option>' +
									'<option value="1.75">1.75x</option>' +
									'<option value="1.5">1.5x</option>' +
									'<option value="1.25">1.25x</option>' +
									'<option value="1" selected>1.0x</option>' +
									'<option value="0.75" >0.75x</option>' +
									'<option value="0.5">0.5x</option>' +
								'</select>' +
							'</div>')
								.appendTo(settingsPanel);

		speedSetting.find('option[value="' + self.settings.speed.toString() + '"]').prop('selected', true);

		speedSetting.on('change', 'select', function() {

			var newValue = $(this).val();
			self.settings.arrangement = newValue;
			self.setValue('player-setting-speed', newValue );

			self.mainVideoNode.playbackRate = parseFloat( newValue );
			self.mainAudioNode.playbackRate = parseFloat( newValue );
		});

		self.mainVideo.on('ratechange', function() {
			console.log('rate changed');
		});



		// Speed
		if (!Detection.isiPhone) {
			var qualitySetting =
								$('<div class="player-setting">' +
									'<label for="">Quality</label>' +
									'<select class="player-quality-setting">' +
										'<option value="720p">720p HD</option>' +
										'<option value="480p">480p SD</option>' +
										'<option value="360p">360p</option>' +
									'</select>' +
								'</div>')
									.appendTo(settingsPanel);

			qualitySetting.find('option[value="' + self.settings.quality.toString() + '"]').prop('selected', true);

			qualitySetting.on('change', 'select', function() {

				var newValue = $(this).val();
				self.settings.arrangement = newValue;
				self.setValue('player-setting-quality', newValue );

				self.changeQuality(newValue);
			});

			self.qualitySetting = qualitySetting;
		} else {
			self.qualitySetting = $();
		}
	},

	builddownload: function() {
		var self = this,
			downloadButton = $('<button class="player-button player-download-button">Download</button>')
				.appendTo(self.controllerButtons),
			downloadPanel = $('<div class="player-download-panel player-panel">' +
									'<span class="player-downloads-title">Download Options</span>' +
									'<table class="player-downloads-table">' +
										'<tr>' +
											'<th>Video</th>' +
											'<td class="player-downloads-video"></td>' +
										'</tr>' +
										'<tr>' +
											'<th>Slides</th>' +
											'<td class="player-downloads-slides"></td>' +
										'</tr>' +
										'<tr>' +
											'<th>Transcript</th>' +
											'<td class="player-downloads-transcript"></td>' +
										'</tr>' +
									'</table>' +
							'</div>')
				.appendTo(self.container).hide(),
			downloadTimeout = null;


		function startSettingsTimeout() {
			clearSettingsTimeout();
			downloadTimeout = setTimeout(downloadOff, 3500);
		}

		function clearSettingsTimeout() {
			if (downloadTimeout != null) {
				clearTimeout(downloadTimeout);
			}
			downloadTimeout = null;
		}
		function downloadOff() {
			downloadPanel.hide();
		}


		// MAIN SETTINGS
		downloadButton.on('click', function() {
			if (downloadPanel.is(':visible')) {
				downloadPanel.hide();
			} else {
				downloadPanel.show();
				downloadPanel.css({
					right: 	self.settings.separation,
					bottom: self.controllerBar.outerHeight(true) + self.settings.separation,
				});

				startSettingsTimeout();
			}
		});

		self.container.find('.player-download-button, .player-download-panel')
				.on('mouseover', function() {
					clearSettingsTimeout();
				})
				.on('mouseout', function() {
					startSettingsTimeout();
				});

		self.container.on('click', function(e) {
			var target = $(e.target),
				clickedOnThis = false;

			// go through all nested clicked elements
			while (target != null && target.length > 0) {

				if (target[0] == downloadButton[0] || target[0] == downloadPanel[0]) {
					clickedOnThis = true;
					break;
				}

				target = target.parent();
			}

			if (!clickedOnThis) {
				downloadPanel.hide();
			}
		});


		// set the download stuff

		self.container.on('player.reset', function() {

			self.container.find('.player-downloads-video, .player-downloads-transcript, .player-downloads-slides').html('');

		});

	},

	setDownloads: function(videoUrls, transcriptUrls, slidesUrls) {

		var self = this;

		function createLinks(array, target) {

			var html = '';

			for (var i=0, il=array.length; i<il; i++) {
				html += '<a href="' + array[i].url + '" target="_blank">' + array[i].title + '</a>';

			}

			self.container.find(target).html(html);
		}

		createLinks(videoUrls, '.player-downloads-video');
		createLinks(transcriptUrls, '.player-downloads-transcript');
		createLinks(slidesUrls, '.player-downloads-slides');

	},

	buildsearch: function() {
		var self = this,
			searchToggle = $('<button class="player-button player-search-button">Search</button>')
				.appendTo(self.headerButtons),
			searchPanel = $('<div class="player-panel player-search-panel">' +
								'<span class="player-panel-close">x</span>' +
								'<span class="player-panel-title">Search Transcripts</span>' +
								'<input type="text" class="player-search-input" placeholder="enter text to search transcripts" />' +
								'<input type="button" class="player-search-action-button player-panel-action-button" value="Search" />' +
								'<div class="player-search-results">' +
								'</div>' +
							'</div>')
				.appendTo(self.container)
				.hide(),

			searchInput = searchPanel.find('.player-search-input'),
			searchActionButton = searchPanel.find('.player-search-action-button'),
			searchResults = searchPanel.find('.player-search-results'),
			closeButton = searchPanel.find('.player-panel-close');

		// show/hide
		searchToggle.on('click', function() {
			if (searchPanel.is(':visible')) {
				searchPanel.hide();
			} else {
				$('.player-panel').hide();
				searchPanel.show();
			}
		});
		closeButton.on('click', function() {
			searchPanel.hide();
		});

		// do search triggers
		searchInput.on('keypress', function(e) {
			if (e.which == 13) {
				startSearch();
			}
		});
		searchActionButton.on('click', function(e) {
			startSearch();
		});

		// user clicks on results
		searchResults.on('click', '.player-search-result', function(e) {

			var result = $(this),
				searchData = JSON.parse(result.attr('data-search'));

			if (self.controller && self.controller.searchCallback) {
				self.controller.searchCallback( searchData );
			}

			searchPanel.hide();
		});


		var isSearching = false;
		function startSearch() {
			searchResults.html('');

			if (isSearching) {
				return;
			}
			isSearching = true;

			var searchUrl = (self.controller && self.controller.getSearchUrl) ? self.controller.getSearchUrl() : '';
			if (searchUrl == '') {
				return;
			}

			searchResults.html('Loading...');

			$.ajax({
				url: searchUrl,
				data: {
					text: searchInput.val()
				},
				success: function(searchData) {

					isSearching = false;

					var html = searchData.length == 0 ? 'Sorry, no results found for "' + searchInput.val() + '"' : '';

					for (var i=0, il=searchData.length; i<il; i++) {

						var searchResult = searchData[i];

						html += '<div class="player-search-result" data-search=\'' + JSON.stringify(searchResult) + '\'>' +
									'<span class="player-search-result-display">' + searchResult.display + '</span>' +
									'<span class="player-search-result-text">' + searchResult.text + '</span>' +
								'</div>';
					}

					searchResults.html(html);


				}
			});
		}
	},

	setSearchInfo: function(searchUrl, searchCallbackHandler) {
		this.searchUrl = searchUrl;
		this.searchCallbackHandler = searchCallbackHandler;
	},

	buildfeedback: function() {
		var self = this,
			feedbackToggle = $('<button class="player-button player-feedback-button">Help</button>')
				.appendTo(self.headerButtons),
			feedbackPanel = $('<div class="player-panel player-feedback-panel">' +
								'<span class="player-panel-close">x</span>' +
								'<span class="player-panel-title">Help &amp; Feedback</span>' +
									'<div class="player-feedback-content">' +
										'<label for="' + self.id + '-feedback-type">Type</label>' +
										'<select id="' + self.id + '-feedback-type" class="player-feedback-type">' +
											'<option>Video problem</option>' +
											'<option>Transcript problem</option>' +
											'<option>Slides problem</option>' +
											'<option>Other</option>' +
										'</select>' +
										'<label for="' + self.id + '-feedback-text">Description</label>' +
										'<textarea id="' + self.id + '-feedback-text" class="player-feedback-text"></textarea>' +
										'<input type="button" value="Send Report"  class="player-feedback-action-button player-panel-action-button" />' +
									'</div>' +
									//'<div class="player-feedback-response">' +
									//	'<p>Thank you for your feedback. Adminstrators will respond soon' +
									//'</div>' +
							'</div>')
				.appendTo(self.container)
				.hide(),
			closeButton = feedbackPanel.find('.player-panel-close'),

			feedbackType = feedbackPanel.find('.player-feedback-type'),
			feedbackText = feedbackPanel.find('.player-feedback-text'),
			sendButton = feedbackPanel.find('.player-feedback-action-button')
			;


		// show/hide
		feedbackToggle.on('click', function() {
			if (feedbackPanel.is(':visible')) {
				feedbackPanel.hide();
			} else {
				$('.player-panel').hide();
				feedbackPanel.show();
			}
		});
		closeButton.on('click', function() {
			feedbackPanel.hide();
		});


		sendButton.on('click', doSend);

		function doSend() {

			feedbackPanel.hide();

			self.controller.sendFeedback(feedbackType.val(), feedbackText.val(), self.mainVideoNode.src, self.mainVideoNode.currentTime, self.transcript.find('.highlight').html() );

			feedbackText.val('');
		}
	},

	buildcurrent: function() {
		var self = this,
			timeCurrent = $('<div class="player-time-current"></div>').appendTo(self.controllerBar);

		function updateCurrentTime() {

			var currentTime = self.mainMediaNode.currentTime;

			if (!isNaN(currentTime) && currentTime > 0) {

				timeCurrent.html( convertSecondsToTimecode( currentTime ) );
			}
		}

		self.mainVideo.on('timeupdate', updateCurrentTime);
		self.mainAudio.on('timeupdate', updateCurrentTime);


		container.on('player.reset', function() {
			timeCurrent.html (convertSecondsToTimecode(0) );
		});
	},

	buildduration: function() {
		var self = this,
			timeDuration = $('<div class="player-time-duration"></div>').appendTo(self.controllerBar);


		function updateDuration() {
			var duration = self.mainMediaNode.duration;

			if (!isNaN(duration) && duration > 0) {
				timeDuration.html( convertSecondsToTimecode(duration) );
			}
		}
		self.mainVideo.on('loadedmetadata', updateDuration);
		self.mainAudio.on('loadedmetadata', updateDuration);

		container.on('player.reset', function() {
			timeDuration.html( convertSecondsToTimecode(0) );
		});

	},

	buildtimeline: function() {

		var self = this,
			doc = $(document),

			timelineOuter = $('<div class="player-timeline-outer"></div>').appendTo(self.controllerBar),
			timelineLoaded = $('<div class="player-timeline-loaded"></div>').appendTo(timelineOuter),
			timelineCurrent = $('<div class="player-timeline-current"></div>').appendTo(timelineOuter),
			timelineHandle = $('<div class="player-timeline-handle"></div>').appendTo(timelineOuter);

		self.timelineOuter = timelineOuter;

		self.mainVideo.on('timeupdate', timelineUpdate);
		self.mainAudio.on('timeupdate', timelineUpdate);


		function timelineUpdate() {

			var currentTime = self.mainMediaNode.currentTime;

			if (!isNaN(currentTime) && currentTime > 0) {

				// adjust rails
				var percent = (self.mainMediaNode.currentTime / self.mainMediaNode.duration * 100);

				timelineCurrent.width( percent + '%' );
				timelineHandle.css({
					left: percent + '%'
				});

				if (self.mainMediaNode.buffered && self.mainMediaNode.buffered.length > 0) {

					timelineLoaded.width( (self.mainMediaNode.buffered.end( self.mainMediaNode.buffered.length-1 ) / self.mainMediaNode.duration * 100) + '%' );
				}
			}
		}

		self.container.on('player.reset', function() {
			timelineCurrent.width(0);
			timelineLoaded.width(0);
			timelineHandle.css({left: 0});
		});


		var isMouseDown = false;

		timelineOuter.on('mousedown touchstart', handleMouseDown);
		//timelineOuter.on('mousedown', handleMouseDown);
		//timelineOuter.on('mousedown', handleMouseMove);

		function handleMouseDown(e) {

			seekTimeline(e);

			doc.on('mouseup touchend', handleMouseUp);
			doc.on('mousemove touchmove', handleMouseMove);
		}

		function handleMouseUp(e) {

			self.isScrubbing = false;

			doc.off('mouseup touchend', handleMouseUp);
			doc.off('mousemove touchmove', handleMouseMove);
		}

		function handleMouseMove(e) {

			self.isScrubbing = true;

			seekTimeline(e);
		}

		function seekTimeline(e) {
			var width = timelineOuter.width(),
				pageX = e.originalEvent && e.originalEvent.pageX > 0 ? e.originalEvent.pageX : e.pageX
				x = pageX - timelineOuter.offset().left;

			if (x < 0) {
				x = 0;
			}

			var
				percent = x/width * 100,
				newTime = self.mainMediaNode.duration * percent / 100;

			self.mainMediaNode.currentTime = newTime;

			timelineCurrent.width( percent + '%' );
			timelineHandle.css({
				left: percent + '%'
			});
		}
	},

	changeQuality: function(quality) {

		var self = this;

		self.mainVideoNode.pause();

		var
			currentTime = self.mainVideoNode.currentTime;
			currentMainVideoUrl = self.mainVideoNode.src,
			currentSlidesVideoUrl = self.slideVideoNode.src,

			newVideo = self.mainVideoUrls.filter(function(v) { return v.quality == quality;});

		if (newVideo.length > 0) {

			self.mainVideo.on('canplay', handleNewLoad);
			self.mainVideoNode.src = newVideo[0].url;
			self.mainVideoNode.load();
		}

		function handleNewLoad() {
			self.mainVideoNode.currentTime = currentTime;
			self.mainVideoNode.play();
			//self.slideVideoNode.currentTime = currentTime;

			self.mainVideo.off('canplay', handleNewLoad);

			self.arrangeContent();
		}
	},

	createEnded: function() {

		var self = this,
			endedPanel = $('<div class="player-ended-panel player-panel">' +

								'<div class="player-ended-play-outline"><div class="player-ended-play-arrow"></div></div>' +

								'<div class="player-ended-message">Next Video</div>' +
								'<div class="player-ended-countdown">5</div>' +
								'<div class="player-ended-stop">Stop Playing</div>' +

							'</div>')
				.appendTo(self.container).hide(),

			nextIntervalID = null,
			nextCurrentTime = 0,
			nextTotalTime = 5;


		function startNextTimer() {
			stopNextTimer();
			nextIntervalID = setInterval(fireNextTimer, 1000);

			nextCurrentTime = nextTotalTime;
			updateCountdown();
		}
		function stopNextTimer() {
			clearInterval(nextIntervalID);
		}

		function fireNextTimer() {
			nextCurrentTime--;
			if (nextCurrentTime <=0) {
				stopNextTimer();

				self.controller.loadNext();
			} else {
				updateCountdown();
			}
		}
		function updateCountdown() {
			endedPanel.find('.player-ended-countdown').html( nextCurrentTime );
		}

		endedPanel.on('click', '.player-ended-play-outline, .player-ended-message, .player-ended-countdown', function() {
			stopNextTimer();
			self.controller.loadNext();
		});
		endedPanel.on('click', '.player-ended-stop', function() {
			stopNextTimer();
			endedPanel.hide();
		});

		function handleEnded() {

			if (!(self.controller && self.controller.loadNext)) {
				return;
			}

			endedPanel.show();

			startNextTimer();

			//self.controller.loadNext();
		}

		self.container.on('player.reset', function() {
			endedPanel.hide();
		});

		self.mainVideo.on('ended', handleEnded);
		self.mainAudio.on('ended', handleEnded);



		self.triggerEnded = function() {
			endedPanel.show();

			startNextTimer();
		}
	},

	loadCourse: function(mainVideoUrls, audioUrl, transcriptUrl, slidesVideoUrl, slidesDataUrl, slideImagesPath, startTime) {

		var self = this;


		// SELECT THE CORRECT MAIN VIDEO BASED ON QUALITY SETTINGS
		self.mainVideoUrls = mainVideoUrls;
		self.audioUrl = audioUrl;
		self.transcriptUrl = transcriptUrl;
		self.slidesVideoUrl = slidesVideoUrl;
		self.slidesDataUrl = slidesDataUrl;
		self.slideImagesPath = slideImagesPath;
		self.startTime = startTime;

		self.reset();

		self._load();

	},

	reload: function() {

		var self = this;

		var startTime = self.mainMediaNode.currentTime;

		self.loadCourse(self.mainVideoUrls, self.audioUrl, self.transcriptUrl, self.slidesVideoUrl, self.slidesDataUrl, self.slideImagesPath, startTime);
	},

	_load: function() {

		var self = this;

		var mainVideoUrls = self.mainVideoUrls,
			audioUrl = self.audioUrl,
			transcriptUrl = self.transcriptUrl,
			slidesVideoUrl = self.slidesVideoUrl,
			slidesDataUrl = self.slidesDataUrl,
			slideImagesPath = self.slideImagesPath,
			startTime = self.startTime;

		// hide all
		self.qualitySetting
				.find('option')
					.prop('selected', false)
					.hide();

		for (var i=0, il=mainVideoUrls.length; i<il; i++) {
			var mainVideo = mainVideoUrls[i];

			// show the option
			var qualityOption = self.qualitySetting.find('option[value=' + mainVideo.quality + ']').show();
			if (mainVideo.quality == self.settings.quality) {
				qualityOption.prop('selected', true);
			}
		}

		var currentQuality = self.qualitySetting.find('option:selected').val(),
			matchingVideos = mainVideoUrls.filter(function(v) { return v.quality == currentQuality;}),
			videoToPlay = matchingVideos.length > 0 ? matchingVideos[0] : mainVideoUrls[0];



		if (self.settings.arrangement == 'audio') {
			self.mainAudioNode.src = audioUrl;
			self.mainAudioNode.load();
			self.mainAudioNode.play();

			self.mainMedia = self.mainAudio;
			self.mainMediaNode = self.mainAudioNode;

		} else {
			// play video
			self.mainVideoNode.src = videoToPlay.url;
			self.mainVideoNode.load();
			self.mainVideoNode.play();

			self.mainMedia = self.mainVideo;
			self.mainMediaNode = self.mainVideoNode;
		}


		function advanceToStartPosition() {
			self.mainMediaNode.currentTime = startTime;
			self.mainMedia.off('canplay loadedmetadata', advanceToStartPosition);
		}

		if (startTime > 0) {
			self.mainMedia.on('canplay loadedmetadata', advanceToStartPosition);
		}

		// make sure correct quality is showing
		self.qualitySetting.find('option[value=' + videoToPlay.quality + ']').show().prop('selected', true);

		if (slidesVideoUrl != '') {
			self.container.addClass('player-videosslides');

			self.slidesContainer.hide();
			self.slideVideoContainer.show();
			self.slideVideoNode.src = slidesVideoUrl;
			self.slideVideoNode.load();

			if (!Detection.isiOS) {
				self.slideVideoNode.play();
			}

		} else if (slidesDataUrl != '') {
			self.container.removeClass('player-videosslides');


			self.slidesContainer.show();
			self.slideVideoNode.src = '';
			self.slideVideoContainer.hide();

			self.loadSlideImages(slidesDataUrl, slideImagesPath);
		}

		self.loadTranscript(transcriptUrl);
	},

	createTranscript: function() {
		var self = this;

		self.currentTranscriptIndex = -1;

		self.transcript = $('<div class="player-transcript"></div>').appendTo(self.container);
		self.transcriptInner = $('<div class="player-transcript-inner"></div>').appendTo(self.transcript);


		self.mainVideo.on('timeupdate', $.proxy(self.updateTranscriptPosition, self) );
		self.mainAudio.on('timeupdate', $.proxy(self.updateTranscriptPosition, self) );

		self.transcriptInner.on('click', 'span', function(e) {
			var line = $(this);

			self.mainMediaNode.currentTime = parseFloat(line.attr('data-start'));
			self.mainMediaNode.play();
		});


		self.container.on('player.reset', function() {

			self.transcriptInner.find('span').remove();
			self.transcript.find('.player-error').remove();
			self.currentTranscriptIndex = -1;

		});

		self.mainVideo.on('metadatareceived loadeddata', $.proxy(self.transcriptDuration, self) );
	},

	updateTranscriptPosition: function() {
		var self = this;

		if (self.isScrubbing) {
			return;
		}


		var currentTime = self.mainMediaNode.currentTime;

		if (!isNaN(currentTime) && currentTime > 0) {

			// sync transcript
			if (self.transcriptData != null && self.transcriptData.length > 0) {

				for (var i = 0; i < self.transcriptData.length; i++) {

					var line = self.transcriptData[i];

					if (currentTime >= line.startTime && currentTime <= line.endTime) {
						
						if (self.currentTranscriptIndex != i) {
							self.showTranscriptLine(i);
						}
						// the break happens here just in case there's a transcript line later in the list that might overlap and trigger flickering
						break;						
					}
				}
			}
		}
	},

	showTranscriptLine: function(transcriptLineIndex) {

		var self = this;

		self.currentTranscriptIndex = transcriptLineIndex;

		// unhighlight old
		self.transcriptInner
			.find('.highlight')
				.removeClass('highlight');

		var line = self.transcriptInner.find('.t-' + transcriptLineIndex).addClass('highlight');

		if (!self.transcript.hasClass('transcript-overlay')) {

			var
				currentScrollTop = self.transcript.scrollTop(),
				currentLinePos = line.position().top,
				absLinePos = currentScrollTop + currentLinePos,
				newScrollTop = absLinePos - ( line.outerHeight(true) * 1);

			// scroll to it
			self.transcript
					.animate({ 'scrollTop': newScrollTop }, 250);
		}
	},

	loadTranscript: function(transcriptUrl) {

		var self = this;

		$.ajax({
			url: transcriptUrl,
			success: function (data) {

				self.transcriptData = [];

				var doc = $(data),
					textNodes = doc.find('cue');

				textNodes.each(function () {
					var textNode = $(this),
						startTime = convertTimecodeToSeconds(textNode.attr('timeCode')),
						text = textNode.attr('text').replace(/(,\s)?uh,?/gi,' ');

					if (self.transcriptData.length > 0) {
						self.transcriptData[self.transcriptData.length-1].endTime = startTime;
					}

					self.transcriptData.push({
						startTime: startTime,
						endTime: startTime+1,
						text: text
					});
				});

				self.transcriptDuration();

				self.buildTranscript();
			},
			error: function () {
				//buildClass();

				$('<div class="player-error">No transcript available</div>')
					.appendTo(self.transcript);
			}
		});
	},

	transcriptDuration: function() {
		var self = this;

		if (!isNaN(self.mainVideoNode.duration) && self.transcriptData != null && self.transcriptData.length > 0) {
			self.transcriptData[self.transcriptData.length-1].endTime = self.mainVideoNode.duration;
		}
	},

	buildTranscript: function() {
		var self = this;

		// add transcript
		var transcriptHtml = '';
		for (var i = 0, il = self.transcriptData.length; i<il; i++) {
			var textData = self.transcriptData[i];

			transcriptHtml += '<span class="t-' + i.toString() + '" data-start="' + textData.startTime + '" data-end="' + textData.endTime + '">' + textData.text + '</span>';
		}

		self.transcriptInner.html(transcriptHtml);

		setTimeout(function() {
			self.adjustTranscriptSize();
		}, 100);
	},

	adjustTranscriptSize: function() {
		var self = this,
			minSize = 7,
			maxSize = 18,
			widestLine = null,
			widestLineWidth = 0;

		// don't try if there's no transcript yet
		if (self.transcriptInner.find('span').length == 0) {
			return;
		}

		// don't try if there's no transcript yet
		if (self.transcript.hasClass('transcript-overlay')) {
			self.transcriptInner.css({fontSize: '14px'});
			return;
		}

		// start with initial
		self.transcriptInner.css({fontSize: minSize + 'px'});

		for (size=minSize+1; size<=maxSize; size++) {

			widestLine = null;
			widestLineWidth = 0;

			// find the widest line
			self.transcriptInner.find('span').each(function() {
				var line = $(this),
					width = line.width();

				if (width > widestLineWidth) {
					widestLineWidth = width;
					widestLine = line;
				}
			});

			if (widestLine == null) {
				break;
			}

			// measure the height of widest one
			var originalHeight = widestLine.height();

			// try this size
			self.transcriptInner.css({fontSize: size + 'px'});

			var newHeight = widestLine.height();

			if (newHeight > originalHeight*2) {

				if (size > minSize) {
					self.transcriptInner.css({fontSize: (size-1) + 'px'});
				}

				break;
			}
		}
	},

	createSlides: function() {
		var self = this;

		self.currentSlideIndex = -1;

		self.slidesContainer = $('<div class="player-slides-images"></div>').appendTo(self.container),
		self.slidesImage = $('<div class="player-slides-images-current" />').appendTo(self.slidesContainer);

		self.mainVideo.on('timeupdate', $.proxy(self.updateSlidesPosition, self) );
		self.mainAudio.on('timeupdate', $.proxy(self.updateSlidesPosition, self) );

		if (!Detection.isiOS) {
			self.mainVideo.on('play', function() {
				self.slideVideoNode.play();
			});
			self.mainVideo.on('pause', function() {
				self.slideVideoNode.pause();
			});

			self.mainAudio.on('play', function() {
				self.slideVideoNode.play();
			});
			self.mainAudio.on('pause', function() {
				self.slideVideoNode.pause();
			});
		}

		self.container.on('player.reset', function() {

			self.currentSlideIndex = -1;

			self.container.find('.player-timeline-marker').remove();
			self.container.find('.player-timeline-marker').remove();

			self.slidesImage
					.find('img').remove();
			self.slidesContainer
					.find('.player-error').remove();
		});

		self.mainVideo.on('metadatareceived loadeddata', $.proxy(self.slidesDuration, self) );
		self.mainVideo.on('metadatareceived loadeddata', $.proxy(self.arrangeSlideThumbs, self) );

		self.mainAudio.on('metadatareceived loadeddata', $.proxy(self.slidesDuration, self) );
		self.mainAudio.on('metadatareceived loadeddata', $.proxy(self.arrangeSlideThumbs, self) );
	},

	updateSlidesPosition: function() {
		var self = this;

		if (self.isScrubbing) {
			return;
		}

		var currentTime = self.mainMediaNode.currentTime;

		if (!isNaN(currentTime) && currentTime > 0) {

			// sync video slides
			if (self.slidesVideoUrl != '') {
				if (Math.abs( currentTime - self.slideVideoNode.currentTime ) > 2) {
					self.slideVideoNode.currentTime = currentTime;


					if (!Detection.isiOS && self.slideVideoNode.paused) {
						self.slideVideoNode.play();
					}
				}
			}

			// sync slides

			if (self.slidesData != null && self.slidesData.length > 0) {

				for (var i = 0; i < self.slidesData.length; i++) {

					var slide = self.slidesData[i];

					if (currentTime >= slide.startTime && currentTime <= slide.endTime) {
						if (self.currentSlideIndex != i) {
							self.showSlide(i);
						}
						// the break happens here just in case there's a slide later in the list that might overlap and trigger flickering
						break;
					}
				}
			}
		}
	},

	loadSlideImages: function(slidesDataUrl, slideImagesPath) {

		var self = this;

		$.ajax({
			url: slidesDataUrl,
			success: function (data) {

				self.slidesData = [];

				var doc = $(data),
					slideNodes = doc.find('cue');

				slideNodes.each(function () {
					var slideNode = $(this),
						startTime = convertTimecodeToSeconds(slideNode.attr('timeCode')),
						slideImageUrl = slideImagesPath + slideNode.attr('slideFileName');

					if (self.slidesData.length > 0) {
						self.slidesData[self.slidesData.length-1].endTime = startTime;
					}

					self.slidesData.push({
						startTime: startTime,
						endTime: startTime+1,
						url: slideImageUrl
					});
				});

				self.slidesDuration();
				self.buildSlides();
			},
			error: function () {
				console.log('- error loading slides');

				$('<div class="player-error">No slides available</div>')
					.appendTo(self.slidesContainer);
			}

		});

	},

	slidesDuration: function() {
		var self = this;

		if (!isNaN(self.mainMediaNode.duration) && self.slidesData != null && self.slidesData.length > 0) {
			self.slidesData[self.slidesData.length-1].endTime = self.mainMediaNode.duration;
		}
	},

	buildSlides: function() {
		var self = this;


		// build thumbs
		for (var i=0, il=self.slidesData.length; i<il; i++) {

			(function createSlide(slideInfo, index) {
				var
					timelineMarker = $('<span class="player-timeline-marker" data-slideindex="' + index + '"></span>')
						.appendTo(self.timelineOuter)
						.css({
							left: (slideInfo.timeCode / self.mainMediaNode.duration * 100) + '%'
						}),
					timelineThumb = $('<div class="player-timeline-thumb" data-slideindex="' + index + '"><img src="' + slideInfo.url + '" /></div>')
						.appendTo(self.timelineOuter)
						.css({
							left: (slideInfo.timeCode / self.mainMediaNode.duration * 100) + '%'
						});

				timelineThumb.find('img').on('load', function() {
					$(this).fadeIn();
				});

				timelineMarker
					.on('mouseover', function() {
						timelineThumb.show();
						var offset = timelineThumb.offset();
						//console.log(offset,  offset.left < self.settings.separation);
						if (offset.left < self.settings.separation) {
							timelineThumb.css({
								left: (self.settings.separation + timelineThumb.outerWidth(true)/2) + 'px'
							});
						}
					})
					.on('mouseout', function() {
						timelineThumb.hide();
					});


			})( self.slidesData[i], i);
		}

		// just add the first one
		self.showSlide(0);
	},

	arrangeSlideThumbs: function() {

		var self = this;

		if (self.slidesData == null) {
			return;
		}

		for (var i=0, il=self.slidesData.length; i<il; i++) {
			var slideInfo = self.slidesData[i],
				markerAndThumb = self.timelineOuter.find('[data-slideindex=' + i + ']');

			markerAndThumb.css({
				left: (slideInfo.startTime / self.mainMediaNode.duration * 100) + '%'
			});
		}
	},

	showSlide: function(slideIndex) {
		var self = this;

		// find existing slide
		var oldSlide = self.slidesImage.find('.current');


		if (self.slidesData != null && slideIndex < self.slidesData.length) {

			self.currentSlideIndex = slideIndex;

			// show this one
			$('<img src="' + self.slidesData[slideIndex].url + '" />')
				.appendTo(self.slidesImage)
				.hide()
				.on('load', function() {

					var newSlide = $(this);

					oldSlide.removeClass('current');
					newSlide
						.addClass('current')
						.fadeIn(function(){
							oldSlide.remove();
						});

				});

		}

	},

	resizePlayer: function(e) {

		var self = this,
			win = window,
			winWidth = win.innerWidth ? win.innerWidth : self.win.width(),
			winHeight = win.innerHeight ? win.innerHeight : self.win.height(),
			separation = self.settings.separation;

		//console.log('resizePlayer', e ? e.type : '', winWidth, winHeight);

		self.container
			.width(winWidth)
			.height(winHeight);


		self.header.css({
			width: winWidth - (separation*2) + 'px',
			top: separation + 'px',
			left: separation + 'px'
		});


		self.controllerBar.css({
			width: winWidth - (separation*2) + 'px',
			bottom: separation + 'px',
			left: separation + 'px'
		});

		self.arrangeContent();
		self.adjustTranscriptSize();
	},

	arrangeContent: function() {

		var self = this,
			container = self.container,
			mainVideo = self.mainVideo,
			mainVideoNode = self.mainVideoNode,
			slideVideo = self.slideVideo,
			slideVideoNode = self.slideVideoNode,
			slidesContainer = self.slidesContainer,
			transcript = self.transcript,
			controllerBar = self.controllerBar,
			header = self.header,
			win = self.win,
			separation = self.settings.separation;


		//console.log('arrangeContent', self.settings.arrangement)


		var videoRatioWidth = (mainVideoNode.videoWidth && mainVideoNode.videoHeight) ? mainVideoNode.videoWidth / mainVideoNode.videoHeight : 16/9, // 16/9
			videoRatioHeight = 1 / videoRatioWidth, // 9/16

			slideRatioWidth = slideVideo.is(':visible') ?
								slideVideoNode.videoWidth ?
									slideVideoNode.videoWidth / slideVideoNode.videoHeight :
									16 / 9 :
								4/3, // assume JPG slides are always 4:3
			slideRatioHeight = 1 / slideRatioWidth, // 9/16

			contentTop = header.outerHeight(true) + (separation*2),
			contentLeft = separation,
			winWidth = window.innerWidth ? window.innerWidth : self.win.width(),
			winHeight = window.innerHeight ? window.innerHeight : self.win.height(),
			contentAreaWidth = winWidth - (separation*2),
			contentAreaHeight = winHeight - (separation*4) - header.outerHeight(true) - controllerBar.outerHeight(true),

			videoWidth = 0,
			videoHeight = 0,
			mediaTop = 0,
			mediaLeft = 0,
			slideWidth = 0,
			slideHeight= 0,
			tsWidth = 0,
			tsHeight= 0
			;

		//self.slideVideoContainer.addClass('remove-letterbox');

		var fake43AspectSlides = self.slideVideoContainer.hasClass('force_4_3');

		if (fake43AspectSlides) {
			slideRatioWidth = 4/3;
			slideRatioHeight = 1/slideRatioWidth;
		}

		// resets


		switch (self.settings.arrangement) {
			case 'stacked':

				transcript.addClass('transcript-overlay');
				self.mainVideoContainer.show();

				// width will always be equal, but height may be different if the ratio is different
				videoHeight = (contentAreaHeight - separation) * (slideRatioWidth / (videoRatioWidth+slideRatioWidth));
				videoWidth = videoRatioWidth * videoHeight;

				slideHeight = contentAreaHeight - videoHeight - separation;
				slideWidth = videoWidth;

				mediaTop = contentTop
				mediaLeft = contentLeft + (contentAreaWidth/2 - slideWidth/2);

				if (videoWidth > contentAreaWidth) {
					// reset height to max
					videoWidth = contentAreaWidth;
					slideWidth = contentAreaWidth;

					videoHeight = videoWidth / videoRatioWidth;
					slideHeight = slideWidth / slideRatioWidth;

					mediaLeft = contentLeft;
					mediaTop = contentTop + contentAreaHeight/2 - ((videoHeight+separation+slideHeight)/2);

				}

				self.mainVideoContainer.css({
					left: mediaLeft,
					top: mediaTop,
					width: videoWidth,
					height: videoHeight
				});

				var slidesCss = {
					left: mediaLeft,
					top: mediaTop + videoHeight + separation,
					width: slideWidth,
					height: slideHeight
				};

				self.slideVideoContainer.css(slidesCss);
				slidesContainer.css(slidesCss);

				transcript.css({
					width: videoWidth,
					left: mediaLeft,
					top: mediaTop + videoHeight - 42, // (mediaHeight / 10)
					height: 42
				});


				break;

			case 'audio':

				transcript.removeClass('transcript-overlay');

				self.mainVideoContainer.hide();

				slideWidth = contentAreaWidth;
				slideHeight = contentAreaWidth / slideRatioWidth ;

				mediaTop = contentTop;
				mediaLeft = contentLeft;

				tsWidth = slideWidth;
				tsHeight = contentAreaHeight - slideHeight - separation;


				if (slideHeight > contentAreaHeight) {
					slideHeight = contentAreaHeight;
					slideWidth = slideHeight * slideRatioWidth;
					mediaLeft = contentLeft + (contentAreaWidth/2 - slideWidth/2);
				}


				var slidesCss = {
					left: mediaLeft,
					top: mediaTop,
					width: slideWidth,
					height: slideHeight
				};

				self.slideVideoContainer.css(slidesCss);
				slidesContainer.css(slidesCss);

				transcript.css({
					width: tsWidth,
					height: tsHeight,
					left: mediaLeft,
					top: mediaTop + slideHeight + separation, // (mediaHeight / 10)
				});


				break;


			case 'equal':

				transcript.addClass('transcript-overlay');
				self.mainVideoContainer.show();

				// height will always be equal, but width may be different if the ratio is different
				videoWidth = (contentAreaWidth - separation) * (videoRatioWidth / (videoRatioWidth+slideRatioWidth));
				videoHeight = videoWidth / videoRatioWidth;

				slideWidth = contentAreaWidth - videoWidth - separation;
				slideHeight = videoHeight; // slideWidth / slideRatioWidth;

				mediaTop = contentTop + (contentAreaHeight/2 - videoHeight/2),
				mediaLeft = contentLeft;

				if (videoHeight > contentAreaHeight) {
					// reset height to max
					videoHeight = contentAreaHeight;
					slideHeight = contentAreaHeight;

					videoWidth = videoHeight * videoRatioWidth;
					slideWidth = slideHeight * slideRatioWidth;

					mediaTop = contentTop;
					mediaLeft = contentAreaWidth/2 - ((videoWidth+separation+slideWidth)/2);
				}


				self.mainVideoContainer.css({
					left: mediaLeft,
					top: mediaTop,
					width: videoWidth,
					height: videoHeight
				});

				var slidesCss = {
					left: mediaLeft + videoWidth + separation,
					top: mediaTop,
					width: slideWidth,
					height: slideHeight
				};

				self.slideVideoContainer.css(slidesCss);
				slidesContainer.css(slidesCss);


				transcript.css({
					width: videoWidth,
					left: mediaLeft,
					top: mediaTop + videoHeight -  42, // (mediaHeight / 10)
					height: 42
				});


				break;

			case 'largevideo':

				transcript.removeClass('transcript-overlay');
				self.mainVideoContainer.show();

				var largeRatio = videoRatioWidth > slideRatioWidth ? 0.70 : 0.65;

				videoWidth = (contentAreaWidth-separation) * largeRatio;
				videoHeight = videoWidth / videoRatioWidth;


				mediaTop = contentTop + (contentAreaHeight/2 - videoHeight/2);
				mediaLeft = contentLeft;

				if (videoHeight > contentAreaHeight) {
					// reset height to max
					videoHeight = contentAreaHeight;
					videoWidth = videoHeight * videoRatioWidth;

					var newMaxWidth = videoWidth / largeRatio + separation;

					mediaTop = contentTop;
					mediaLeft = contentLeft + (contentAreaWidth/2 - newMaxWidth/2);

					// reset this?
					contentAreaWidth = newMaxWidth;
				}


				slideWidth = contentAreaWidth - videoWidth - separation; // videoWidth * (1-largeRatio);  //
				slideHeight = slideWidth / slideRatioWidth;

				tsWidth = slideWidth;
				tsHeight = videoHeight - slideHeight - separation;


				self.mainVideoContainer.css({
					left: mediaLeft,
					top: mediaTop,
					width: videoWidth,
					height: videoHeight
				});

				var slidesCss = {
					left: mediaLeft + videoWidth + separation,
					top: mediaTop,
					width: slideWidth,
					height: slideHeight
				};

				self.slideVideoContainer.css(slidesCss);
				slidesContainer.css(slidesCss);

				transcript.css({
					left: mediaLeft + videoWidth + separation,
					top: mediaTop + separation + slideHeight,
					width: tsWidth,
					height: tsHeight
				});

				break;

			case 'largeslides':

				transcript.removeClass('transcript-overlay');
				self.mainVideoContainer.show();


				var largeRatio = videoRatioWidth > slideRatioWidth ? 0.62 : 0.65;

				slideWidth = (contentAreaWidth-separation) * largeRatio;
				slideHeight = slideWidth / slideRatioWidth;

				mediaTop = contentTop + (contentAreaHeight/2 - slideHeight/2);
				mediaLeft = contentLeft;

				if (slideHeight > contentAreaHeight) {
					// reset height to max
					slideHeight = contentAreaHeight;
					slideWidth = slideHeight * slideRatioWidth;

					var newMaxWidth = slideWidth / largeRatio + separation;

					mediaTop = contentTop;
					mediaLeft = contentLeft + (contentAreaWidth/2 - newMaxWidth/2);

					// reset this?
					contentAreaWidth = newMaxWidth;
				}


				videoWidth = contentAreaWidth - slideWidth - separation;
				videoHeight = videoWidth / videoRatioWidth;

				tsWidth = videoWidth;
				tsHeight = slideHeight - videoHeight - separation;

				self.mainVideoContainer.css({
					left: mediaLeft,
					top: mediaTop,
					width: videoWidth,
					height: videoHeight
				});

				var slidesCss = {
					left: mediaLeft + videoWidth + separation,
					top: mediaTop,
					width: slideWidth,
					height: slideHeight
				};

				self.slideVideoContainer.css(slidesCss);
				slidesContainer.css(slidesCss);

				transcript.css({
					left: mediaLeft,
					top: mediaTop + separation + videoHeight,
					width: tsWidth,
					height: tsHeight
				});



				break;

		}
	}
}