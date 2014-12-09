// create namespace for photo app
var photoApp = {};

photoApp.key = '6dc9a63fb8c3029af8e9243978eac6c3';
photoApp.geometry = '72157649493244415';
photoApp.cities = '72157649493262935';
photoApp.people = '72157647155835954';
photoApp.nature = '72157649479219901';
photoApp.food = '72157630963777870';
photoApp.bunny = '72157633032755170';
photoApp.home = 'index';

photoApp.clickedStream = $('ul.nav .active').data('photostream').toLowerCase();
console.log(photoApp.clickedStream);
photoApp.lastChecked = 0;
photoApp.pageNum = 1;

photoApp.container = $('.img-container');

// ajax call to retrieve photo data
photoApp.getPhotos = function(photoStream) {
	if (photoStream == 'index') {
		callURL = 'https://api.flickr.com/services/rest/?method=flickr.people.getPhotos&api_key=' + photoApp.key + '&user_id=84373566%40N07&extras=geo%2C+date_taken&per_page=20&page=' + photoApp.pageNum + '&format=json&jsoncallback=?';
	}
	else {
		callURL = 'https://api.flickr.com/services/rest/?method=flickr.photosets.getPhotos&api_key=' + photoApp.key + '&photoset_id=' + photoStream + '&extras=geo%2C+date_taken&per_page=20&page=' + photoApp.pageNum + '&format=json&jsoncallback=?';
		// console.log(callURL);
	}

	// console.log(callURL);

	$.ajax({
		url : callURL,
		type : 'GET',
		dataType : 'jsonp',
		success : function(data) {
			console.log(data);
			if(data.photoset) {
				var photoArray = data.photoset.photo;
			}
			else {
				var photoArray = data.photos.photo;
			}

			photoApp.makeURLs(photoArray);
		}
	});
}


// use returned data to construct URLs for photos
photoApp.makeURLs = function(set) {
	var numPhotos = set.length;
	photoApp.orderedSet = set.reverse();
	var idx = 1;

	for (var i = 0; i < numPhotos; i++) {
		this.photoInfo = photoApp.orderedSet[i];
		this.assembledURL = 'https://farm' + this.photoInfo.farm + '.staticflickr.com/' + this.photoInfo.server + '/' + this.photoInfo.id + '_' + this.photoInfo.secret + '_z.jpg';

		photoApp.displayPhotos(this.assembledURL, this.photoInfo, idx);
		idx++;
		if(idx > 3) {
			idx = 1;
		}
	};
}

// display photos on the page
photoApp.displayPhotos = function(imgSRC, imgData, idx) {
	var $img = $('<img>').attr('src', imgSRC).attr('class', 'box');
	// add data to each image for access later
	$img.attr('data-dateTaken', imgData.datetaken).attr('data-lat', imgData.latitude).attr('data-long', imgData.longitude).attr('data-title', imgData.title);
	if(idx == 3) {
		$img.addClass('last');
	}
	photoApp.container.append($img);
}

photoApp.launchInfo = function(clickedImg) {
	var el = $(clickedImg);
	var $src = el.attr('src');
	$('large-img').attr('src', $src);
	var $title = el.data('title');
	var $dateTaken = el.data('dateTaken');
	var $latitude = el.data('lat');
	var $longitude = el.data('long');

	if(el.hasClass('last')) {
		var lastImageInRow = el;
	}
	else {
		var lastImageInRow = el.nextAll().filter('.last')[0];
		lastImageInRow = $(lastImageInRow);
	}

	var infoContainer = $('.info-container').remove();
	// do all your inserting here
	infoContainer.find('img.large-img').attr('src', $src);
	infoContainer.find('h2').text($title);
	photoApp.loadMap($latitude, $longitude);

	lastImageInRow.after(infoContainer);
	$('.info-container').toggle();
}

photoApp.closeInfo = function(clickedImg) {

}

photoApp.loadMap = function(latitude, longitude) {
      var mapOptions = {
      	center: { lat: 34, lng: 21 },
        zoom: 8
      };
      var mapDiv = $('.map-container')[0];
      photoApp.map = new google.maps.Map(mapDiv , mapOptions);
    
}

photoApp.init = function() {
	photoApp.getPhotos(photoApp[photoApp.clickedStream]);

	var $sectionLink = $('ul.nav a');
	$sectionLink.on('click', function(e) {

		photoApp.container.empty();
		photoApp.pageNum = 1;

		photoApp.clickedStream = $(this).data('photostream').toLowerCase();
		photoApp.getPhotos(photoApp[photoApp.clickedStream]);

	}); // end click handler section links

	$(window).on('scroll', function() {
	   if($(window).scrollTop() + $(window).height() > $(document).height()) {
	       var now = new Date().getTime();
	       var timeBetween = (now - photoApp.lastChecked) / 1000;

	       if(timeBetween > 2) {
		       photoApp.pageNum++;
		       // console.log(photoApp.pageNum);
		       photoApp.getPhotos(photoApp[photoApp.clickedStream]);
		       photoApp.lastChecked = new Date().getTime()
	       }
		 }
	}); // end scroll handler

	$('.img-container').on('click', 'img', function() {
		$('.info-container').hide();

		photoApp.launchInfo(this);

	}); // end img click handler
}

$(function() {
	photoApp.init();
});


// on click on image do what?
// option 1. have lightbox type thing to open larger, display some info
// option 2. expand downward like google images and show map & info