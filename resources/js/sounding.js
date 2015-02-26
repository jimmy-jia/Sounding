var ref = new Firebase('https://sounding.firebaseio.com/');
var postRef= ref.child('posts');
function loadPage(){
	songpost();
	updatepost(initial);
}

// New POST//
function newPost(){
	var formData=document.getElementById("postform");
	var linkID = getId(formData.elements[0].value);
	if (linkID!='error' && formData.elements[1].value){
		postRef.push({
			'link': formData.elements[0].value,
			'title': formData.elements[1].value,
			'artist': formData.elements[2].value,
			'description': formData.elements[3].value,
			'tags' : formData.elements[4].value.toLowerCase().split(" ")
		});
		formData.reset();
		showpost();
	}
	else{
		alert("Your input is invalid! Please edit and try again");
	}
}
// GET Items //
var i=1;
var j=11;
var initial=1;
function songpost(){
	postRef.on('value', function(postSnapshot){
		var songData=postSnapshot.val();

		var objectsData=Object.getOwnPropertyNames(songData).sort();
		var length=objectsData.length;
		while(objectsData[length-i] && i<j){
			var returnvalue=objectsData[length-i];
			i++;
			var curSong=songData[returnvalue];
			createPost(curSong.link, curSong.title, curSong.artist, curSong.description);
		}
	});
}
// Update //
function updatepost(initial){
	initial=1;
	postRef.limitToLast(1).on('child_added', function(snapshot){
		if (initial){
			initial=0;
		}
		else{
			songData=snapshot.val();
			topPost(songData.link, songData.title, songData.artist, songData.description);
		}
	});
}
function createPost(link, title, artist, description){
	displayVideo(getId(link), title, artist, description);
}
// REGEX URL stripper //
function getId(link) {
    var regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    var match = link.match(regExp);
    if (match && match[2].length == 11) {
        return match[2];
    } else {
        return 'error';
    }
}
// Post Card //
function displayVideo(videoId, title, artist, description){
	var videoDiv = $('<div class="item"><iframe src="http://www.youtube.com/embed/' + videoId + '" frameborder="0" allowfullscreen></iframe></div>');
	$('<p/>').text(title).appendTo($(videoDiv));
	$('<p/>').text(artist).appendTo($(videoDiv));
	$('<p/>').text(description).appendTo($(videoDiv));
	$("#postcontent").append(videoDiv);
}
// Load More //
function loadMore(){
	j+=10;
	songpost();
}
function topPost(link, title, artist, description){
	updateVideo(getId(link), title, artist, description);
	i++;
	j++;
}
function updateVideo(videoId, title, artist, description){
	var videoDiv = $('<div class="item"><iframe src="https://www.youtube.com/embed/' + videoId + '" frameborder="0" allowfullscreen></iframe></div>').hide();
	$('<p/>').text(title).appendTo($(videoDiv));
	$('<p/>').text(artist).appendTo($(videoDiv));
	$('<p/>').text(description).appendTo($(videoDiv));
	$("#postcontent").prepend(videoDiv);
	$(videoDiv).fadeIn(500);
}
// FB Integration //
var login=0;
var userid=null;
$(document).ready(logincheck());
function logincheck(){
	FB.getLoginStatus(function(response) {
    statusChangeCallback(response);
});
	if (reponse.status=="connected"){
		login=1;
		userid=response.authResponse.userID;
	}

}

// Tags //
function search(tag){
	var found = 0;
	postRef.on('value', function(postSnapshot){
		var songData=postSnapshot.val();
		var objectsData=Object.getOwnPropertyNames(songData).sort();
		var length=objectsData.length;
		while(i<=length){
			var returnvalue=objectsData[length-i];
			i++;
			var curSong=songData[returnvalue];
			for(var k=0; k<curSong.tags.length; k++){
				if(curSong.tags[k]==tag.tag){
					found=1;
					createPost(curSong.link, curSong.title, curSong.artist, curSong.description);
				}				
			}
		}
		if (!found){
			var sorryDiv = $('<div class="sorry">Sorry, no matching videos were found.<br> Please try again.</div>');
			$("#postcontent").append(sorryDiv);
		}
	});
}
function getUrlVars() {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
        vars[key] = value.toLowerCase();
    });
    search(vars);
}