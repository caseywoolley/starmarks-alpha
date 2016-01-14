angular.module('utils', [])
  .factory('utils', function(){
    return{
      compareStr: function(stra, strb){
        stra = ("" + stra).toLowerCase();
        strb = ("" + strb).toLowerCase();
        return stra.indexOf(strb) !== -1;
      }
    };
  });