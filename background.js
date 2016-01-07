/*
var app = {};



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

 */
/*
chrome.bookmarks.getTree(function(bookmarkTree) {
    console.log('bookmarks', bookmarkTree);
  });

var getBookmarkList = function(callback) {
  //get chorme bookamrks
  chrome.bookmarks.getTree(function(bookmarkTree) {
    console.log('bookmarks', bookmarkTree);
    console.log('size', roughSizeOfObject(bookmarkTree));
    //get starmarks data
    chrome.storage.local.get(null, function(starData) {
      console.log('starMarks', starData);
      var mergeMarks = function(node) {
        var list = [];
        //base - add bookmark if has url
        if (node.url !== undefined) {
          var starMark = starData[node.url];
          //if starMark doesn't exist - add default starMark entry
          if (starMark === undefined) {
            starMark = {
              stars: 0,
              visits: 0
            };
            var url = node.url;
            var saveMark = {};
            saveMark[node.url] = starMark;
            //save starData
            chrome.storage.local.set(saveMark, function() {
              console.log('starData saved');
            });
          }
          bookmark = node;
          delete bookmark.children; //don't need this
          bookmark = _.extend(bookmark, starMark);
          list.push(bookmark);
        } else {
          //else add tag if doesn't exist 
        }

        //recurse
        if (node.children && node.children.length > 0) {
          for (var i = 0; i < node.children.length; i++) {
            var child = node.children[i];
            list = list.concat(mergeMarks(child));
          }
        }
        return list;
      };
      var fullList = mergeMarks(bookmarkTree[0]);

      callback(fullList);
    });
  });

};

//var allBookmarks = getBookmarkList(function(data){ return data; });
console.log(allBookmarks);

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
  	console.log('hi');
  	console.log(allBookmarks);
    console.log(sender.tab ?
                "from a content script:" + sender.tab.url :
                "from the extension");
    if (request.bookmarks == "all")
      sendResponse({bookmarks: 'allBookmarks'});
  });
*/
 


