const KEY = 'GestureLock';

var Store = {
	set: function(val){
		window.localStorage.setItem(KEY, JSON.stringify(val));
	},
	get: function(){
		return JSON.parse(window.localStorage.getItem(KEY));
	},
	del: function(){
		window.localStorage.removeItem(KEY);
	}
}