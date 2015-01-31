var ref = new Firebase('https://sounding.firebaseio.com/');
var postRef= ref.child('posts');
songpost();
function newPost(){
	var formData=document.getElementById("postform");
	var linkID = getId(formData.elements[0].value);
	if (linkID!='error' && formData.elements[1].value){
		postRef.push({
			'link': formData.elements[0].value,
			'title': formData.elements[1].value,
			'artist': formData.elements[2].value,
			'description': formData.elements[3].value
		});
		formData.reset();
		showpost();
	}
	else{
		alert("Your input is invalid! Please edit and try again");
	}
}
var i=1;
var j=10;
var initial=1;
function songpost(){
	postRef.on('value', function(postSnapshot){
		var songData=postSnapshot.val();
		console.log(songData);
		var objectsData=Object.getOwnPropertyNames(songData);
		var length=objectsData.length;
		while(objectsData[length-i] && i<j){
			var returnvalue=objectsData[length-i];
			i++;
			var curSong=songData[returnvalue];
			createPost(curSong.link, curSong.title, curSong.artist, curSong.description);
		}
	});
}
updatepost(initial);
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
	displayVideo(getId(link));
	displayPost(title, artist, description);
}
function getId(link) {
    var regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    var match = link.match(regExp);
    if (match && match[2].length == 11) {
        return match[2];
    } else {
        return 'error';
    }
}
function displayVideo(videoId){
	var videoDiv = $('<div class="item"><iframe src="http://www.youtube.com/embed/' + videoId + '" frameborder="0" allowfullscreen></iframe></div>');
	$("#postcontent").append(videoDiv);
	
}
function displayPost(title, artist, description){
	var newDiv = $('<div class="item"></div>');
	$('<p/>').text(title).appendTo($(newDiv));
	$('<p/>').text(artist).appendTo($(newDiv));
	$('<p/>').text(description).appendTo($(newDiv));
	$("#postcontent").append(newDiv);
	
}
function loadMore(){
	j+=10;
	songpost();
}
function topPost(link, title, artist, description){
	updatePost(title, artist, description);
	updateVideo(getId(link));
	i++;
}
function updateVideo(videoId){
	var videoDiv = $('<div class="item"><iframe src="http://www.youtube.com/embed/' + videoId + '" frameborder="0" allowfullscreen></iframe></div>').hide();
	$("#postcontent").prepend(videoDiv);
	$(videoDiv).slideDown(500);
}
function updatePost(title, artist, description){
	var newDiv = $('<div class="item"></div>').hide();
	$('<p/>').text(title).appendTo($(newDiv));
	$('<p/>').text(artist).appendTo($(newDiv));
	$('<p/>').text(description).appendTo($(newDiv));
	$("#postcontent").prepend(newDiv);
	$(newDiv).slideDown(500);
}