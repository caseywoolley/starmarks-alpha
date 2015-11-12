
$(function(){
	//get all storage data
  chrome.storage.sync.get(null, function(data) {
    console.log('starMarks: ', data);

    var $starMarks = $('.starmarks');

    for ( var url in data ){
    	starMark = data[url];
    	$starMarks.append('<li class="starmark"><span class="star-rating">'+ ( starMark.stars || 0 ) +
    		'</span><a class="starmark-link" href="' + url + '">' + 
    		(starMark.title || 'untitled') +'</a></li>');
        //chrome.storage.sync.remove(url); reset bookmarks
    }
  });


});

//TODO: zip together bookmarks tree with starmarks data?

var listMarks = function(){

};