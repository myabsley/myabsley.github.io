// create namespace for photo app
var photoApp = {};

photoApp.key = '6dc9a63fb8c3029af8e9243978eac6c3';
photoApp.geometry = '72157649493244415';
photoApp.cities = '72157649493262935';
photoApp.people = '72157647155835954';
photoApp.nature = '72157649479219901';
photoApp.food = '72157630963777870';
photoApp.bunny = '72157633032755170';
photoApp.home = 'home'

photoApp.clickedStream = 'home';
photoApp.lastChecked = 0;
photoApp.pageNum = 1;

photoApp.container = $('.container');

// ajax call to retrieve photo data
photoApp.getPhotos = function(photoStream) {
	if (photoStream === 'home') {
		callURL = 'https://api.flickr.com/services/rest/?method=flickr.people.getPhotos&api_key=' + photoApp.key + '&user_id=84373566%40N07&per_page=20&page=' + photoApp.pageNum + '&format=json&jsoncallback=?';
	}
	else {
		callURL = 'https://api.flickr.com/services/rest/?method=flickr.photosets.getPhotos&api_key=' + photoApp.key + '&photoset_id=' + photoStream + '&format=json&jsoncallback=?';
		console.log(callURL);
	}

	console.log(callURL);

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

photoApp.makeURLs = function(set) {
	var numPhotos = set.length;
	var orderedSet = set.reverse();

	for (var i = 0; i < numPhotos; i++) {
		this.photoInfo = orderedSet[i];
		this.assembledURL = 'https://farm' + this.photoInfo.farm + '.staticflickr.com/' + this.photoInfo.server + '/' + this.photoInfo.id + '_' + this.photoInfo.secret + '_z.jpg';

		photoApp.displayPhotos(this.assembledURL, this.photoInfo);
	};
}

photoApp.displayPhotos = function(imgSRC, imgData) {
	var $img = $('<img>').attr('src', imgSRC).attr('class', 'box');
	photoApp.container.append($img);
}

photoApp.init = function() {
	photoApp.getPhotos('home');
}

$(function() {
	photoApp.init();

	var $sectionLink = $('a.section');
	$sectionLink.on('click', function(e) {
		e.preventDefault();

		photoApp.container.empty();
		photoApp.pageNum = 1;

		photoApp.clickedStream = $(this).data('photostream');
		photoApp.getPhotos(photoApp[photoApp.clickedStream]);
		console.log(photoApp.clickedStream);

	}); // end click handler section links

	$(window).on('scroll', function() {
	   if($(window).scrollTop() + $(window).height() > $(document).height() - 150) {
	       var now = new Date().getTime();
	       var timeBetween = (now - photoApp.lastChecked) / 1000;

	       if(timeBetween > 2) {
		       photoApp.pageNum++;
		       console.log(photoApp.pageNum);
		       photoApp.getPhotos(photoApp.clickedStream);
		       photoApp.lastChecked = new Date().getTime()
	       }
		 }
	}); // end scroll handler
});

// on click on image do what?
// option 1. have lightbox type thing to open larger, display some info
// option 2. expand downward like google images and show map & info