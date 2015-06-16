var ref = new Firebase('https://sounding.firebaseio.com/');
var postRef= ref.child('posts');
var idbank = [];
var current;
function start(){
	loader();
	newPost();
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
// New Post //
function submitPost(){
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
		post();
	}
	else{
		if(linkID=='error'){
			formData.elements[0].style.paddingBottom= '8px';
			formData.elements[0].style.borderBottom= '4px solid red';
			$('#posturl').shake(4, 8, 500);
		}
		if(!formData.elements[1].value){
			formData.elements[1].style.paddingBottom= '8px';
			formData.elements[1].style.borderBottom= '4px solid red';
			$('#posttitle').shake(3, 8, 500);
		}
	}
}
jQuery.fn.shake = function(intShakes, intDistance, intDuration) {
    this.each(function() {
        $(this).css("position","relative"); 
        for (var x=1; x<=intShakes; x++) {
        $(this).animate({left:(intDistance*-1)}, (((intDuration/intShakes)/4)))
    .animate({left:intDistance}, ((intDuration/intShakes)/2))
    .animate({left:0}, (((intDuration/intShakes)/4)));
    }
  });
return this;
};

// GET Items //
var i=1;
var j=16;
var initial=1;
function loader(){
	postRef.on('value', function(postSnapshot){
		var songData=postSnapshot.val();
		var objectsData=Object.getOwnPropertyNames(songData).sort();
		var length=objectsData.length;
		while(objectsData[length-i] && i<j){
			var returnvalue=objectsData[length-i];
			i++;
			var curSong=songData[returnvalue];
			createPost(getId(curSong.link), curSong.title, curSong.artist, curSong.description, curSong.tags);
		}
	});
}
// Post Card //
function createPost(id, title, artist, description, tags){
	var pid="&quot;"+id+"&quot;"
	var div = $('<div class="item" id="'+id+'"><img src="http://img.youtube.com/vi/' + id + '/mqdefault.jpg"></img><div><img onclick="cinema('+pid+')"></img></div></div>');
	$('<p/>').text(title).appendTo($(div));
	$('<p/>').text(artist).appendTo($(div));
	$('<p/>').text(description).appendTo($(div));
	$("#posts").append(div);
	idbank.push(id);
}
// Load More //
function loadMore(){
	j+=10;
	loader();
}
// Update //
function newPost(initial){
	initial=1;
	postRef.limitToLast(1).on('child_added', function(snapshot){
		if (initial){
			initial=0;
		}
		else{
			songData=snapshot.val();
			updateVideo(getId(songData.link), songData.title, songData.artist, songData.description, songData.tags);
		}
	});
}
function updateVideo(id, title, artist, description, tags){
	i++;
	j++;
	var pid="&quot;"+id+"&quot;"
	var div = $('<div class="item" id="'+id+'"><img src="http://img.youtube.com/vi/' + id + '/mqdefault.jpg"></img><div><img onclick="cinema('+pid+')"></img></div></div>').hide();
	$('<p/>').text(title).appendTo($(div));
	$('<p/>').text(artist).appendTo($(div));
	$('<p/>').text(description).appendTo($(div));
	$("#posts").prepend(div);
	$(div).fadeIn(500);
	idbank.unshift(id);
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
					createPost(getId(curSong.link), curSong.title, curSong.artist, curSong.description, curSong.tags);
				}				
			}
		}
		if (!found){
			var sorryDiv = $('<div class="sorry">Sorry :( <br> No matching videos were found, please try again.</div>');
			$("#posts").append(sorryDiv);
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

function next(){
	var idx=idbank.indexOf(current);
	if(idx+1<idbank.length)
		cinema(idbank[idx+1]);
	/*else
		$(".next").shake(3, 8, 500);*/
}
function prev(){
	var idx=idbank.indexOf(current);
	if(idx>0)
		cinema(idbank[idx-1]);
	/*else
		$(".prev").shake(3, 8, 500);*/
}
function cinema(id){
	current=id;
	var cinemaDiv=document.getElementById('cinema');
	var holdDiv = document.getElementById(id);
	cinemaDiv.childNodes[3].src='http://www.youtube.com/embed/' + id+ "?color=white;autoplay=1";
	cinemaDiv.childNodes[5].innerHTML=holdDiv.childNodes[2].innerHTML;
	cinemaDiv.childNodes[7].innerHTML=holdDiv.childNodes[3].innerHTML;
	cinemaDiv.childNodes[9].innerHTML=holdDiv.childNodes[4].innerHTML;
	$('#infoup').fadeOut();
	$('#popup').fadeOut();
	$('#cinema').fadeIn(400);
	$('#modalshadow').fadeIn(400);
}