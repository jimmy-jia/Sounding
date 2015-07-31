var ref = new Firebase('https://sounding.firebaseio.com/');
var postRef= ref.child('posts');
var idbank = [];
var current;
var minimized = false;
function start(){
	loader();
	newPost();
	ref.onAuth(authentication);
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
	var div = $('<div class="item" id="'+id+'"><img src="http://img.youtube.com/vi/' + id + '/mqdefault.jpg" onclick="cinema('+pid+')"></img><div><img onclick="cinema('+pid+')"></img></div></div>');
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


// Search //
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


//Cinema//
function next(){
	var idx=idbank.indexOf(current);
	if(idx+1<idbank.length)
		cinema(idbank[idx+1]);
}
function prev(){
	var idx=idbank.indexOf(current);
	if(idx>0)
		cinema(idbank[idx-1]);
}
function cinema(id){
	current=id;
	var cinemaDiv=document.getElementById('cinema');
	var holdDiv = document.getElementById(id);
	cinemaDiv.childNodes[3].src='http://www.youtube.com/embed/' + id+ "?color=white;autoplay=1";
	cinemaDiv.childNodes[5].innerHTML=holdDiv.childNodes[2].innerHTML;
	cinemaDiv.childNodes[7].innerHTML=holdDiv.childNodes[3].innerHTML;
	cinemaDiv.childNodes[9].innerHTML=holdDiv.childNodes[4].innerHTML;
	if(!minimized){
		$('#infoup').fadeOut();
		$('#popup').fadeOut();
		$('#cinema').fadeIn(400);
		$('#modalshadow').fadeIn(400);
	}
	if(mobileCheck() && minimized)
		maximize();
}


function mobileCheck(){
	var check = false;
	(function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4)))check = true})(navigator.userAgent||navigator.vendor||window.opera);
	return check;
}

//Authentication//

var userref=ref.child('users');
var isNewUser = true;

function authentication(){
	authData = ref.getAuth();
	if (authData && isNewUser) {
		// save the user's profile into Firebase so we can list users,
		// use them in Security and Firebase Rules, and show profiles
		ref.child("users").child(authData.uid).set({
			provider: authData.provider,
			name: getName(authData)
		});
	}
	if(authData){
		$('#logintxt').text(getName(authData));
		var onk = document.getElementById('auth');
		onk.onclick=logout;
	}
}

function getName(authData) {
	switch(authData.provider) {
		case 'password':
			return authData.password.email.replace(/@.*/, '');
		case 'twitter':
			return authData.twitter.displayName;
		case 'facebook':
			return authData.facebook.displayName;
  }
}

function logout(){
	ref.unauth();
	console.log('Logged Out');
	$('#logintxt').text('Login');
	var onk = document.getElementById('auth');
	try{
		var onk = document.getElementById('auth');
		onk.onclick=login;
	}
	catch(err){
		console.log(err);
	}
}

function login(){
	ref.authWithOAuthPopup("facebook", function(error, authData) {
		if (error) {
			if (error.code === "TRANSPORT_UNAVAILABLE") {
				ref.authWithOAuthRedirect("facebook", function(error) {
				}
			)}
			else
				console.log("Login Failed!", error);
		} else {
			console.log("Authenticated successfully with payload:", authData);
		}
	});
}




//Navigation//
var loaded=0;
$(window).scroll(function () {
	setTimeout(function(){loaded=1},1);
    if ($(window).scrollTop() >= $(document).height() - $(window).height() - 10) {
    	if(loaded==1){
    		loadMore();}
	}
});
function post(){
	$('#infoup').fadeOut();
	$('#settings').fadeOut();
	$('#tags').fadeOut();
	$('#popup').fadeToggle(400);
}
function info(){
	$('#popup').fadeOut();
	$('#settings').fadeOut();
	$('#tags').fadeOut();
	$('#infoup').fadeToggle(400);
}
function cinemaclose(){
	var cinemaDiv=document.getElementById('cinema');
	cinemaDiv.childNodes[3].src="";
	$('#cinema').fadeToggle(400);
	$('#modalshadow').fadeToggle(400);
}
function mobsearch(){
	$('.search').slideToggle(400);
}
function showauthmenu(){
	$('#login').slideToggle(400);
}
function settings(){
	$('#popup').fadeOut();
	$('#infoup').fadeOut();
	$('#tags').fadeOut();
	$('#settings').fadeToggle(400);
}
function tags(){
	$('#popup').fadeOut();
	$('#infoup').fadeOut();
	$('#settings').fadeOut();
	$('#tags').fadeToggle(400);
}
function minimize(){
	minimized = true;
	$('#shifting').toggleClass('minimizeanim');
	setTimeout(function(){
		$('#maximize').fadeIn(400);
		$('#cinema').hide();
	}, 1200);
	$('#modalshadow').fadeToggle(400);
}
function maximize(){
	$('#maximize').fadeOut(400);
	$('#cinema').show();
	$('#shifting').toggleClass('minimizeanim');
	$('#modalshadow').fadeToggle(400);
	minimized = false;
}