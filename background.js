var app = {};

console.log('loaded');

chrome.runtime.onInstalled.addListener(function() {
  //import bookmarks into starmarks
});

chrome.webNavigation.onCompleted.addListener(function(details) {
	console.log('loaded');
	chrome.tabs.create({
      url: 'starManager.html'
    });
	//get current tab
	//load starmark instance if exists
});


