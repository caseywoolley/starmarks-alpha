angular.module('app')
.factory('StarMarks', function() {

  //TODO: convert to a background page service
  var loading = false;
  var allBookmarks = [];
  var allTags = {};

  var add = function(bookmark, callback) {
    var chromeMark = {
      parentId: '1',
      title: bookmark.title,
      url: bookmark.url
    };
    //save chrome bookmark
    chrome.bookmarks.create(chromeMark, function(newBookmark) {
      //build starmark on returned chrome bookmark
      var starMark = angular.extend(bookmark, newBookmark);
      starMark.visits = 1;
      starMark.lastVisit = Date.now();
      
      var saveObj = {};
      saveObj[starMark.url] = starMark;
      //save starmark
      chrome.storage.local.set(saveObj, function(data) {
        callback(starMark);
        console.log('added:', starMark);
      });
    });    
  };

  var get = function(url, callback) {
    chrome.storage.local.get(url, function(data){
      var url = Object.keys(data)[0];
      console.log('got:', data[url]);
      callback(data[url]);
    });
  };

  var update = function(bookmark, callback){
    //check if bookmark exists then update
    get(bookmark.url, function(data) {
      if (data){
        var saveObj = {};
        saveObj[bookmark.url] = bookmark;
        chrome.storage.local.set(saveObj, function(){
  	    	console.log('updated:', bookmark);
          if (callback) { callback(bookmark); }
        });
      }
    });
  };

  var deleteBookmark = function(bookmark){
    var ids = bookmark.ids;
    for (var i = 0; i < ids.length; i++){
      chrome.bookmarks.remove(ids[i]);
    }
    console.log('deleted bookmark ids:', ids);
    chrome.storage.local.remove(bookmark.url);
    console.log('removed:', bookmark);
  };

  var getBookmarkList = function(callback) {
    //get chorme bookamrks
    loading = true;

    chrome.bookmarks.getTree(function(bookmarkTree) {
      console.log('bookmarks', bookmarkTree);
      console.log('size', roughSizeOfObject(bookmarkTree));
      //get allBookmarks data
      chrome.storage.local.get(null, function(starData) {
        console.log('allBookmarks', starData);

        var currentTag;
        //key - id table
        var tagIds = {};
        var mergeMarks = function(node) {
          var list = {};
          
          //base - add bookmark if has url
          if (node.url !== undefined) {
            var starMark = starData[node.url];

            //if starMark doesn't exist - add default starMark entry
            if (starMark === undefined || starMark.stars === 0) {
              starMark = {
                stars: 1,
                visits: 1,
                lastVisit: node.dateAdded
              };
              var url = node.url;
              var saveMark = {};
              saveMark[node.url] = starMark;
              //save starData
              chrome.storage.local.set(saveMark, function() {
                console.log('starData saved');
              });
            }

            //temporary - fix inconsistent values
            if (starMark.visits === 0){
              starMark.visits = 1;
            }
            if (typeof starMark.stars === 'string'){
              starMark.stars = parseInt(starMark.stars);
            }

            if (starMark.lastVisit === undefined){
              starMark.lastVisit = node.dateAdded;
            }

            //temporary - add tags object
            if (starMark.tags === undefined || Array.isArray(starMark.tags)){
              starMark.tags = {};
            }
            //temporary - add id array
            if (starMark.ids === undefined){
              starMark.ids = [];
            }
            //push tags to starMark
            if (currentTag !== undefined){
              starMark.tags[currentTag] = currentTag;
            }


            bookmark = node;
            delete bookmark.children; //bookmarks don't need this
            //collect all ids associated for global deletion
            starMark.ids.push(bookmark.id);
            bookmark = _.extend(bookmark, starMark);
            //list.push(bookmark);
            list[node.url] = bookmark;
          } else {
            //else add tag if doesn't exist 
            currentTag = node.title.toLowerCase();
            tagIds[node.title.toLowerCase()] = currentTag.split(' ')[0];
          }

          //recurse
          if (node.children && node.children.length > 0) {
            for (var i = 0; i < node.children.length; i++) {
              var child = node.children[i];
              //list = list.concat(mergeMarks(child));
              list = _.extend(list, mergeMarks(child));
            }
          }
          return list;
        };
        var fullList = mergeMarks(bookmarkTree[0]);

        var arrList = [];
        var keys = Object.keys(fullList);
        for (var i = 0; i < keys.length; i++){
          arrList.push(fullList[keys[i]]);
        }

        allBookmarks = arrList;
        callback(arrList);
        console.log('tags:', tagIds);
        allTags = tagIds;
        loading = false;
      });
    });

  };

    var roughSizeOfObject = function(object) {

    var objectList = [];
    var stack = [object];
    var bytes = 0;

    while (stack.length) {
      var value = stack.pop();

      if (typeof value === 'boolean') {
        bytes += 4;
      } else if (typeof value === 'string') {
        bytes += value.length * 2;
      } else if (typeof value === 'number') {
        bytes += 8;
      } else if (
        typeof value === 'object' && objectList.indexOf(value) === -1
      ) {
        objectList.push(value);

        for (var i in value) {
          stack.push(value[i]);
        }
      }
    }
    return bytes;
  };

  return {
    getBookmarkList: getBookmarkList,
    add: add,
    get: get,
    update: update,
    deleteBookmark, deleteBookmark,
    loading: loading,
    allBookmarks: allBookmarks,
    allTags: allTags,
    getTags: function(){return allTags; }
  };

});

