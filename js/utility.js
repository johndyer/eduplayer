function convertSecondsToTimecode(seconds) {
	seconds = Math.round(seconds);
	minutes = Math.floor(seconds / 60);
	minutes = (minutes >= 10) ? minutes : "0" + minutes;
	seconds = Math.floor(seconds % 60);
	seconds = (seconds >= 10) ? seconds : "0" + seconds;
	return minutes + ":" + seconds;
}


function convertTimecodeToSeconds(timecode) {
	timecode = timecode.replace(/&#xD;/g, '').replace(/&#xA;/g, '');

	var parts = timecode.split(':');

	if (parts.length == 3) {
		return parseInt(parts[0], 10) * 360 +
				parseInt(parts[1], 10) * 60 +
				parseInt(parts[2], 10);
	} else if (parts.length == 2) {
		return parseInt(parts[0], 10) * 60 +
				parseInt(parts[1], 10);
	} else if (parts.length == 1) {
		return parseInt(parts[0], 10);
	} else {
		return -1;
	}
}

/* sadly, no way to user feature detection */
var Detection = (function() {
	
	var nav = navigator,
		ua = nav.userAgent,
		
		isiPad = ua.toLowerCase().indexOf('ipad') > -1,
		isiPhone = ua.toLowerCase().indexOf('iphone')  > -1;
	
	
	return {
		isiPad: isiPad,
		isiPhone: isiPhone,
		isiOS: (isiPad || isiPhone)	
	}
	
})();
