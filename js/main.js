//@codekit-prepend "jquery-1.10.2.min.js"
//@codekit-prepend "jquery.event.special.js"
//@codekit-prepend "jquery.easing.min.js"
// @codekit-prepend "lightbox-2.6.min.js"
//@codekit-prepend "handlebars-v1.1.2.js" 

//Globals
var duration;
var seek_time;
var seek_bar_left;
var seek_bar_right;
var seek_scrub;
var seek_bar_width;
var xPos;
var name;
var cam_toggle;
var mic_toggle;
var rec_toggle;
var fav_toggle;
var mic_index = 0;//0 default mic
var cam_index = 0;//0 default cam
var drag = false;
var play_toggle = false;
var playing = false;
var recording = false;
var connection_open = false;
var current_video;
var current_user;
var user_avatar;
var user_avatar_array = [];
var comments_array = [];
var user_array = [];
var created_array = [];
var video_array = [];

//firebase globals
var db = new Firebase('https://adamgedney.firebaseio.com/');
var video_obj = db.child('/videos');
var comments_obj = db.child('/comments');



// var globalError = function(message){
// 	console.log(message, "error mess");
// }






//==========================================callbacks=================================//
var connected = function(success, error){
	 console.log(success, error);
	if(success){
		connection_open = true;

		if(recording){
			flash.startRecording(name,cam_index,mic_index);
		}else{
			flash.startPlaying(current_video);
		};
	}else{
		connection_open = false;
	}
};






var getDuration = function(dur){
	duration = dur;
};






var seekTime = function(time){
	seek_time = time;

	xPos = (seek_time / duration) * seek_bar_right;

	// scrub position update only when not dragging
	if(!drag){
		$('#seek_bar_scrub').offset({left: seek_bar_left + xPos});
	}

};// seekTime()






//auth callback
var auth = new FirebaseSimpleLogin(db, function(error, user){

	if(!error){
		if(user.provider == "github"){
			current_user = user.displayName;
			user_avatar = user.avatar_url;
			login();
		}else if(user.provider == "twitter"){
			current_user = user.displayName;
			user_avatar = user.profile_image_url;
			login();
		}
	}
});







//
//end callbacks
//





//========================Seek Bar drag/drop functionality=========================//
	//mousedown to start drag
	$(document).on('mousedown', '#seek_bar_scrub', function(e){
		drag = true;

		//required to prevent text selection on mouseout of seek_bar
		e.preventDefault();
		moving();
	});

	//mouseup to stop drag
	$(document).on('mouseup', function(e){
		drag = false;
	});

	//drag and setTime
	function moving(){
		$(document).on('mousemove', function(e){
			var set_time = ((e.pageX - seek_bar_left) / seek_bar_width) * duration;

			if(drag){

				$('#seek_bar_scrub').offset({left: e.pageX});

				//sets scrub time
				flash.setTime(set_time);

				//creates a border 
				if(seek_scrub < seek_bar_left){
					$('#seek_bar_scrub').offset({left: seek_bar_left});

				}else if(seek_scrub > (seek_bar_right  - $('#seek_bar_scrub').width())){
					$('#seek_bar_scrub').offset({left: (seek_bar_right - $('#seek_bar_scrub').width())});

				};
			};
		});
	};










	//flash ready serves as document ready
	var flashReady = function(){
		
		//sets init volume to 70
		$('#vol_bar').val(100);
		


		
		$(document).on('click', '#play_btn', function(e){
			
			play_video();
		});
	};// flashReady()


	//set volume init
	$(document).on('change', function(e){
		
		var vol = $('#vol_bar').val() / 100;
			vol = vol.toFixed(1);

			flash.setVolume(vol);
	});


	function play_video(){
		//handles connect or play/pause toggle
			if(!playing){
				flash.stopRecording();
				flash.connect('rtmp://localhost/SMSServer/');

				playing = true;
				recording = false;

			}else{
				flash.playPause();
			}


			//handles image toggle
			if (!play_toggle){
				
				$('#play_btn').attr('src', 'images/pause.png');
				play_toggle = true;
				
			}else{
				$('#play_btn').attr('src', 'images/play.png');
				play_toggle = false;
			}
	};










//---------------------------Templating--------------------------//
init();

function init(){

	$.get('templates/templates.html', function(htmlArg){

		var source = $(htmlArg).find('#logged_out').html();
		var template = Handlebars.compile(source);
		// var context = {id: posts._id, title:posts.title, created: posts.created, author: posts.author, category: posts.category, text: posts.text}
		// var html = template(context);

		$('#content').append(template);

		//defaults to hide upon program load
		$('.transport_popup').hide();
		$('.rec_select').hide();
		$('.mic_select').hide();
		$('.cam_select').hide();
		$('.login_popup').hide();
		$('.sub_list').hide();

	});//get()
};//init()



//--------------------On login, $.get logged in state----------------//
$(document).on('click', '#login_gh', function(e){

	//github authentication
	auth.login('github');
});

$(document).on('click', '#login_tw', function(e){

	//github authentication
	auth.login('twitter');
});




	function login(){
		$.get('templates/templates.html', function(htmlArg){

			var source = $(htmlArg).find('#logged_in').html();
			var template = Handlebars.compile(source);
			// var context = {id: posts._id, title:posts.title, created: posts.created, author: posts.author, category: posts.category, text: posts.text}
			// var html = template(context);

			$('#content').empty();
			$('#content').append(template);

			//defaults to hide upon program load
			$('.transport_popup').hide();
			$('.rec_select').hide();
			$('.mic_select').hide();
			$('.cam_select').hide();
			$('.stop_rec_modal').hide();
			$('.login_popup').hide();
			$('.sub_list').hide();


			seek_bar_width = $('#seek_bar_inner').width();
			seek_bar_left = Math.floor($('#seek_bar_inner').offset().left);
			seek_bar_right = seek_bar_left + seek_bar_width;
			seek_scrub = $('#seek_bar_scrub').offset().left;


			swfobject.embedSWF(
		    "swf/higley_wigley.swf", "flashContent",
		    "100%", "100%",
		    swfVersionStr, xiSwfUrlStr,
		    flashvars, params, attributes);
			// JavaScript enabled so display the flashContent div in case it is not replaced with a swf object.
			swfobject.createCSS("#flashContent", "display:block;text-align:left;");

			//populates comments & video fields
			get_comments();
			get_videos();


		});//get()
	};//login()






//Controls logout
$(document).on('click', '#login_state', function(e){

	if($('#login_state').html() == "Logout"){

		//logs out facebook or twitter
		auth.logout();

		$.get('templates/templates.html', function(htmlArg){

			var source = $(htmlArg).find('#logged_out').html();
			var template = Handlebars.compile(source);
			// var context = {id: posts._id, title:posts.title, created: posts.created, author: posts.author, category: posts.category, text: posts.text}
			// var html = template(context);

			$('#content').empty();
			$('#content').append(template);

			//defaults to hide upon program load
			$('.transport_popup').hide();
			$('.rec_select').hide();
			$('.mic_select').hide();
			$('.cam_select').hide();
			$('.login_popup').hide();
			$('.sub_list').hide();

		});//get()
	};// if
});



//-------------Show/hide login dropdown----------------//

var log_toggle = false;

$(document).on('click', '#login_state', function(e){

	if(!log_toggle){
		$('.login_popup').fadeIn();
		log_toggle = true;
	}else{
		$('.login_popup').fadeOut();
		log_toggle = false;
	}
});








//====================Show/Hide mic/cam/rec options=====================//

//camera select popup
$(document).on('click', '#camera_btn', function(e){
	
	if (!cam_toggle){
		//hides other popups
		$('.mic_select').hide();
		$('.rec_select').hide();
		$('#mic_btn').css('opacity', '1');
		rec_toggle = false;
		mic_toggle = false;

		$('#camera_btn').css('opacity', '.5');
		$('.transport_popup').fadeIn();
		$('.cam_select').fadeIn();

		cam_toggle = true;

		//get and loop through attached cameras
		var cam_list = flash.getCameras();
		$('.cameras').empty();

		for(var i=0; i<cam_list.length; i++){
			var li = '<li><a id="' + i + '" href="#">' +  cam_list[i].substr(0, 18) + '</a></li>';
			$('.cameras').append(li);
		}
		
	}else{
		$('#camera_btn').css('opacity', '1');
		$('.transport_popup').fadeOut();
		$('.cam_select').fadeOut();

		cam_toggle = false;
	}
	
});

//select and store camera choice
$(document).on('click', '.cameras a', function(e){
	e.preventDefault();
	cam_index = $(this).attr("id");
});





//mic select popup
$(document).on('click', '#mic_btn', function(e){
	
	if (!mic_toggle){
		//hides other popups
		$('.cam_select').hide();
		$('.rec_select').hide();
		$('#camera_btn').css('opacity', '1');
		cam_toggle = false;
		rec_toggle = false;

		$('#mic_btn').css('opacity', '.5');
		$('.transport_popup').fadeIn();
		$('.mic_select').fadeIn();

		mic_toggle = true;

		//get and loop through attached cameras
		var mic_list = flash.getMicrophones();
		$('.mics').empty();

		for(var j=0; j<mic_list.length; j++){
			var li = '<li><a id="' + j + '" href="#">' +  mic_list[j].substr(0, 20) + '</a></li>';
			$('.mics').append(li);
		}


	}else{
		$('#mic_btn').css('opacity', '1');
		$('.transport_popup').fadeOut();
		$('.mic_select').fadeOut();

		mic_toggle = false;
	}
	
});

//select and store microphone choice
$(document).on('click', '.mics a', function(e){
	e.preventDefault();
	mic_index = $(this).attr("id");
});








//record popup
$(document).on('click', '#rec_btn', function(e){
	
	if (!rec_toggle){
		//hides other popups
		$('.mic_select').hide();
		$('.cam_select').hide();
		$('#rec_btn').attr('src', 'images/cancel_rec.png');
		$('#rec_btn').attr('title', 'Cancel Recording');
		$('#mic_btn').css('opacity', '1');
		$('#cam_btn').css('opacity', '1');
		cam_toggle = false;
		mic_toggle = false;

		$('.transport_popup').fadeIn();
		$('.rec_select').fadeIn();

		rec_toggle = true;
	}else{
		$('#rec_btn').attr('src', 'images/rec.png');
		$('#rec_btn').attr('title', 'Record A Video');

		$('.transport_popup').fadeOut();
		$('.rec_select').fadeOut();

		rec_toggle = false;
	}
	
});



//start recording
$(document).on('click', '#start_recording', function(e){
	e.preventDefault();

	name = $('#name').val();
	var cat = $('#category').val();
	var desc = $('#file_desc').val();

	//opens connection
	flash.stopPlaying();
	flash.connect('rtmp://localhost/SMSServer/');
	recording = true;
	playing = false;

	// $('.poster').fadeOut();
	$('.stop_rec_modal').fadeIn();

	//resets the record modal
	$('#rec_btn').attr('src', 'images/rec.png');
	$('#rec_btn').attr('title', 'Record A Video');
	$('.transport_popup').fadeOut();
	$('.rec_select').fadeOut();
	rec_toggle = false;

	//adds video to database
	video_obj.push({video: name, category: cat, description: desc, author: current_user, created_date: get_datetime()});


});



//stop recording button
$(document).on('click', '#stop_rec', function(e){
	flash.stopRecording();
	$('.stop_rec_modal').hide();


	// $('.poster').fadeIn();

});	











//-------------Favorites button------------//
$(document).on('click', '#fav_btn', function(e){
	
	if (!fav_toggle){
		$('#fav_btn').attr('src', 'images/star_y.png');
		fav_toggle = true;
	}else{
		$('#fav_btn').attr('src', 'images/star.png');
		fav_toggle = false;
	}
	
});













//------------body_nav header pin----------------//
// var click;
// $(window).scroll(function(e){
// 	var y_pos = $(document).scrollTop();
// 	var div_top = $('.body_nav').offset();

// 	//remove div from document flow and pin to top of window
// 	//***********put in a toggle o prevent css setting on every pixel scrolled
// 	if(div_top.top <= y_pos){
// 		$('.body_nav').css({
// 			'position' : 'fixed',
// 			'top' : '0',
// 			"z-index" : '9999'
// 		});

// 		//plays a click as header is pinned
// 		if(!click){
// 			var mp3 = new Audio('sounds/click.mp3').play();
// 			click = true;
// 		};

// 		//creates a smoother transition as div leaves document flow
// 		$('.page').css('marginBottom', '90px');
// 	}

// 	//reinstate div's normal position in document.
// 	if(div_top.top < '749'){
// 		$('.body_nav').css({
// 			'position' : 'relative',
// 			'top' : '0',
// 			"z-index" : '9999'
// 		});

// 		click = false;
// 		$('.page').css('marginBottom', '0');
// 	}
// });




//------------Category Dropdown----------------//
var cat_toggle;
var v_toggle;
var f_toggle;

$(document).on('click', '.drop_down', function(e){
	e.preventDefault();

	
	if($(this).html() == 'My Videos'){

		if(!v_toggle){
			$('.vid_cats').fadeOut();
			$('.favorited_vids').fadeOut();
			f_toggle = false;
			cat_toggle = false;

			$('.my_vids').fadeIn();
			v_toggle = true;
		}else{
			$('.my_vids').fadeOut();
			v_toggle = false;
		}

	}else if($(this).html() == 'Favorites'){

		if(!f_toggle){
			$('.my_vids').fadeOut();
			$('.vid_cats').fadeOut();
			cat_toggle = false;
			v_toggle = false;

			$('.favorited_vids').fadeIn();
			f_toggle = true;
		}else{
			$('.favorited_vids').fadeOut();
			f_toggle = false;
		}

	}else if($(this).html() == 'Categories'){

		if(!cat_toggle){
			$('.favorited_vids').fadeOut();
			$('.my_vids').fadeOut();
			f_toggle = false;
			v_toggle = false;

			$('.vid_cats').fadeIn();
			cat_toggle = true;
		}else{
			$('.vid_cats').fadeOut();
			cat_toggle = false;
		}
	};
});


$(document).on('click', '.sub_list a', function(e){
	e.preventDefault();

	$('.sub_list').fadeOut();
	cat_toggle = false;
	v_toggle = false;
	f_toggle = false;
});















//============================Click Handlers==============================//

	//set comments
	$(document).on('click', '#submit_comment', function(e){
		e.preventDefault();
		var com = $('#new_comment').val();
		var usr = current_user;
		var d = get_datetime();
		var t = current_video;


		//pushes comment into messages object
		comments_obj.push({user: usr, avatar: user_avatar, comment: com, created: d, title: t});

		//resets comment form
		$('#new_comment').val('');

		//gets comments and appends to comment list
		$('.comments_wrapper').empty();
		get_comments();

	});






	//select lesson from list & set current video to this value
	$(document).on('click', '.lesson', function(e){

		var this_title = $(this).find('h2').html();
		var this_time = $(this).find('h3').html();
		var this_desc = $(this).find('p').html();

		current_video = this_title + ".flv";

		flash.stopPlaying();
		play_video();


		render_info(this_title, this_time, this_desc);
	});













//============================Getters/Setters==============================//

	//retrieve comments when there is a new one
	//store in the comments_array
	function get_comments(){

		comments_obj.on('child_added', function (snapshot) {
		    
		    var comments = snapshot.val().comment;
		    var users = snapshot.val().user;
		    var created = snapshot.val().created;
		    var avatar = snapshot.val().avatar;

		  	//empties arrays
		  	comments_array = [];
		  	user_array = [];
		  	created_array = [];
		  	user_avatar_array = [];
		  	

		  	//pushes result strings into arrays
		  	comments_array.push(comments);
		  	user_array.push(users);
		  	created_array.push(created);
		  	user_avatar_array.push(avatar);

		  
		  	render_comments();
		});
	}; //get_comments()









	
	function get_videos(){

		video_obj.on('child_added', function (snapshot) {
		  
		   	video_array = [];
		    video_array.push(snapshot.val());
		  	
		  	render_videos();
		});
	}; //get_comments()













	function get_datetime(){
		// datetime on 12 hr clock
		var d = new Date();
		var	day = d.getDay();
		var month = d.getMonth() + 1;
		var year = d.getFullYear();
		var hour = d.getHours();
		var minutes = d.getMinutes();
		var time;
		if(hour > 12){
			hour = hour - 12;
			time = hour + ":" + minutes;

			time += "pm";
		}

		return month + "/" + day + "/" + year + " " + time;
	};



//============================Renderers==============================//
	function render_videos(){
		
	  	for (var l=0;l<video_array.length;l++){
		  	
		  	var s = '<div class="lesson">';
				s += '<img src="images/thumb.jpg" alt="video thumbnail"/>';
				s += '<h2>' + video_array[l].video + '</h2>';
				s += '<h3>' + video_array[l].created_date + '</h3>';
				s += '<p>' + video_array[l].description + '</p>';
				s += '</div><!-- ./lesson-->';			
									
		  	$('.lessons_container').append(s);
		};// for
	};

	









	function render_comments(){
		
	  	for (var k=0;k<comments_array.length;k++){
		  	
		  	var s = '<div class="comment">';
		  		s += '<a href="' + user_avatar_array[k] + '" data-lightbox="avatar id" ><img src="' + user_avatar_array[k] + '" alt="user avatar" /></a>';
		  		s += '<h2>' + user_array[k] + '</h2>';
		  		s += '<h3>' + created_array[k] + '</h3>';
		  		s += '<p>' + comments_array[k] + '</p>';
				s += '</div><!-- /.comment-->';					
									
		  	$('.comments_wrapper').append(s);
		};// for
	};










	function render_info(title, time, desc){

		var s = '<div class="title_wrapper">';
			s += '<h1>' + title + '</h1>';
			s += '<p class="time">' + time + '</p>';
			s += '</div><!-- /.title_wrapper-->';
			s += '<p class="desc_copy">' + desc + '</p>';
			s += '<div class="desc_gallery">';
			s += '<a href="images/poster.jpg" data-lightbox="movie screenshots"><img src="images/shot.jpg" alt="movie screenshot 1"/></a>';
			s += '<a href="images/poster.jpg" data-lightbox="movie screenshots"><img src="images/shot.jpg" alt="movie screenshot 2"/></a>';
			s += '</div><!-- /.desc_gallery-->';

		$('.desc').append(s);
	};



































