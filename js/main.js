//@codekit-prepend "jquery-1.10.2.min.js"
//@codekit-prepend "jquery.event.special.js"
//@codekit-prepend "jquery.easing.min.js"
//@codekit-prepend "lightbox-2.6.min.js"
//@codekit-prepend "handlebars-v1.1.2.js" 


//Globals
var global = {
}

global.duration;
global.seek_time;
global.seek_bar_left;
global.seek_bar_right;
global.seek_scrub;
global.seek_bar_width;
global.xPos;
global.name;
global.cam_toggle;
global.mic_toggle;
global.rec_toggle;
global.fav_toggle;
global.cat_toggle;
global.v_toggle;
global.f_toggle;
global.log_toggle = false;
global.mic_index = 0;//0 default mic
global.cam_index = 0;//0 default cam
global.drag = false;
global.play_toggle = false;
global.playing = false;
global.recording = false;
global.connection_open = false;
global.current_video;// = "cowscowscows1.flv";
global.current_user;
global.user_avatar;
global.user_avatar_array = [];
global.comments_array = [];
global.user_array = [];
global.created_array = [];
global.new_video = false;


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

		if(global.recording){
			flash.startRecording(global.name, global.cam_index, global.mic_index);
		}else{
			flash.startPlaying(global.current_video);
		};
	}else{
		global.connection_open = false;
	}
};






var getDuration = function(dur){
	global.duration = dur;
};






var seekTime = function(time){
	global.seek_time = time;

	global.xPos = (global.seek_time / global.duration) * global.seek_bar_right;

	// scrub position update only when not dragging
	if(!global.drag){
		$('#seek_bar_scrub').offset({left: global.seek_bar_left + global.xPos});
	}

};// seekTime()






//auth callback
var auth = new FirebaseSimpleLogin(db, function(error, user){

	if(!error){
		if(user.provider == "github"){
			global.current_user = user.displayName;
			global.user_avatar = user.avatar_url;
			login();
		}else if(user.provider == "twitter"){
			global.current_user = user.displayName;
			global.user_avatar = user.profile_image_url;
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
		global.drag = true;

		//required to prevent text selection on mouseout of seek_bar
		e.preventDefault();
		moving();
	});

	//mouseup to stop drag
	$(document).on('mouseup', function(e){
		global.drag = false;
	});

	//drag and setTime
	function moving(){
		$(document).on('mousemove', function(e){
			var set_time = ((e.pageX - global.seek_bar_left) / global.seek_bar_width) * global.duration;

			if(global.drag){

				$('#seek_bar_scrub').offset({left: e.pageX});

				//sets scrub time
				flash.setTime(set_time);

				//creates a border 
				if(global.seek_scrub < global.seek_bar_left){
					$('#seek_bar_scrub').offset({left: global.seek_bar_left});

				}else if(global.seek_scrub > (global.seek_bar_right  - $('#seek_bar_scrub').width())){
					$('#seek_bar_scrub').offset({left: (global.seek_bar_right - $('#seek_bar_scrub').width())});

				};
			};
		});
	};










	//flash ready serves as document ready
	var flashReady = function(){
		
		//sets init volume to 70
		$('#vol_bar').val(100);
		

		//play click handler
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
			if(!global.playing){
				flash.stopRecording();
				flash.connect('rtmp://localhost/SMSServer/');

				global.playing = true;
				global.recording = false;
				global.new_video = false;

			}else if(global.playing && !global.recording && global.new_video){

				flash.stopPlaying();
				flash.connect('rtmp://localhost/SMSServer/');
				global.new_video = false;

			}else if(global.playing && !global.new_video){
				
				flash.playPause();

			}

		


			//handles image toggle
			if (!global.play_toggle){
				
				$('#play_btn').attr('src', 'images/pause.png');
				global.play_toggle = true;
				
			}else{
				$('#play_btn').attr('src', 'images/play.png');
				global.play_toggle = false;
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
		hide_popups();

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
			hide_popups();
			$('.stop_rec_modal').hide();


			global.seek_bar_width = $('#seek_bar_inner').width();
			global.seek_bar_left = Math.floor($('#seek_bar_inner').offset().left);
			global.seek_bar_right = global.seek_bar_left + global.seek_bar_width;
			global.seek_scrub = $('#seek_bar_scrub').offset().left;


			swfobject.embedSWF(
		    "swf/higley_wigley.swf", "flashContent",
		    "100%", "100%",
		    swfVersionStr, xiSwfUrlStr,
		    flashvars, params, attributes);
			// JavaScript enabled so display the flashContent div in case it is not replaced with a swf object.
			swfobject.createCSS("#flashContent", "display:block;text-align:left;");

			//populates comments & video fields
			
			
			setTimeout(function(){
				get_videos();
			}, 500);
			
			// get_comments();

		});//get()
	};//login()






	function hide_popups(){
		$('.transport_popup').hide();
		$('.rec_select').hide();
		$('.mic_select').hide();
		$('.cam_select').hide();
		$('.login_popup').hide();
		$('.sub_list').hide();
	};



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
			hide_popups();

		});//get()
	};// if
});



//-------------Show/hide login dropdown----------------//
$(document).on('click', '#login_state', function(e){

	if(!global.log_toggle){
		$('.login_popup').fadeIn();
		global.log_toggle = true;
	}else{
		$('.login_popup').fadeOut();
		global.log_toggle = false;
	}
});








//====================Show/Hide mic/cam/rec options=====================//

//camera select popup
$(document).on('click', '#camera_btn', function(e){
	
	if (!global.cam_toggle){
		//hides other popups
		$('.mic_select, .rec_select').hide();
		$('#mic_btn').css('opacity', '1');
		global.rec_toggle = false;
		global.mic_toggle = false;

		$('#camera_btn').css('opacity', '.5');
		$('.transport_popup, .cam_select').fadeIn();

		global.cam_toggle = true;

		//get and loop through attached cameras
		var cam_list = flash.getCameras();
		$('.cameras').empty();

		for(var i=0; i<cam_list.length; i++){
			var li = '<li><a id="' + i + '" href="#">' +  cam_list[i].substr(0, 18) + '</a></li>';
			$('.cameras').append(li);
		}
		
	}else{
		$('#camera_btn').css('opacity', '1');
		$('.transport_popup, .cam_select').fadeOut();

		global.cam_toggle = false;
	}
	
});

//select and store camera choice
$(document).on('click', '.cameras a', function(e){
	e.preventDefault();
	global.cam_index = $(this).attr("id");
});





//mic select popup
$(document).on('click', '#mic_btn', function(e){
	
	if (!global.mic_toggle){
		//hides other popups
		$('.cam_select, .rec_select').hide();
		$('#camera_btn').css('opacity', '1');
		global.cam_toggle = false;
		global.rec_toggle = false;

		$('#mic_btn').css('opacity', '.5');
		$('.transport_popup, .mic_select').fadeIn();

		global.mic_toggle = true;

		//get and loop through attached cameras
		var mic_list = flash.getMicrophones();
		$('.mics').empty();

		for(var j=0; j<mic_list.length; j++){
			var li = '<li><a id="' + j + '" href="#">' +  mic_list[j].substr(0, 20) + '</a></li>';
			$('.mics').append(li);
		}


	}else{
		$('#mic_btn').css('opacity', '1');
		$('.transport_popup, .mic_select').fadeOut();

		global.mic_toggle = false;
	}
	
});

//select and store microphone choice
$(document).on('click', '.mics a', function(e){
	e.preventDefault();
	global.mic_index = $(this).attr("id");
});








//record popup
$(document).on('click', '#rec_btn', function(e){
	
	if (!global.rec_toggle){
		//hides other popups
		$('.mic_select, .cam_select').hide();
		$('#rec_btn').attr('src', 'images/cancel_rec.png').attr('title', 'Cancel Recording');
		$('#mic_btn, #cam_btn').css('opacity', '1');
		global.cam_toggle = false;
		global.mic_toggle = false;

		$('.transport_popup, .rec_select').fadeIn();

		global.rec_toggle = true;
	}else{
		$('#rec_btn').attr('src', 'images/rec.png').attr('title', 'Record A Video');

		$('.transport_popup, .rec_select').fadeOut();

		global.rec_toggle = false;
	}
	
});



//start recording
$(document).on('click', '#start_recording', function(e){
	e.preventDefault();

	global.name = $('#name').val();
	var cat = $('#category').val();
	var desc = $('#file_desc').val();

	//opens connection
	flash.stopPlaying();
	flash.connect('rtmp://localhost/SMSServer/');
	global.recording = true;
	global.playing = false;

	// $('.poster').fadeOut();
	$('.stop_rec_modal').fadeIn();

	//resets the record modal
	$('#rec_btn').attr('src', 'images/rec.png').attr('title', 'Record A Video');
	$('.transport_popup, .rec_select').fadeOut();
	global.rec_toggle = false;

	//adds video to database
	video_obj.push({video: global.name, category: cat, description: desc, author: global.current_user, created_date: get_datetime()});


});



//stop recording button
$(document).on('click', '#stop_rec', function(e){
	flash.stopRecording();
	$('.stop_rec_modal').hide();

});	











//-------------Favorites button------------//
$(document).on('click', '#fav_btn', function(e){
	
	if (!global.fav_toggle){
		$('#fav_btn').attr('src', 'images/star_y.png');
		global.fav_toggle = true;
	}else{
		$('#fav_btn').attr('src', 'images/star.png');
		global.fav_toggle = false;
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
$(document).on('click', '.drop_down', function(e){
	e.preventDefault();

	
	if($(this).html() == 'My Videos'){

		if(!global.v_toggle){
			$('.vid_cats, .favorited_vids').fadeOut();
			global.f_toggle = false;
			global.cat_toggle = false;

			$('.my_vids').fadeIn();
			global.v_toggle = true;
		}else{
			$('.my_vids').fadeOut();
			global.v_toggle = false;
		}

	}else if($(this).html() == 'Favorites'){

		if(!global.f_toggle){
			$('.my_vids, .vid_cats').fadeOut();
			global.cat_toggle = false;
			global.v_toggle = false;

			$('.favorited_vids').fadeIn();
			global.f_toggle = true;
		}else{
			$('.favorited_vids').fadeOut();
			global.f_toggle = false;
		}

	}else if($(this).html() == 'Categories'){

		if(!global.cat_toggle){
			$('.favorited_vids, .my_vids').fadeOut();
			global.f_toggle = false;
			global.v_toggle = false;

			$('.vid_cats').fadeIn();
			global.cat_toggle = true;
		}else{
			$('.vid_cats').fadeOut();
			global.cat_toggle = false;
		}
	};
});


$(document).on('click', '.sub_list a', function(e){
	e.preventDefault();

	$('.sub_list').fadeOut();
	global.cat_toggle = false;
	global.v_toggle = false;
	global.f_toggle = false;
});















//============================Click Handlers==============================//

	//set comments
	$(document).on('click', '#submit_comment', function(e){
		e.preventDefault();
		
		set_comment();

	});






	//select lesson from list & set current video to this value
	$(document).on('click', '.lesson', set_video);














//============================Getters/Setters==============================//
	function set_comment(){
		var com = $('#new_comment').val();
		var usr = global.current_user;
		var d = get_datetime();
		var t = global.current_video;


		//pushes comment into messages object
		comments_obj.push({user: usr, avatar: global.user_avatar, comment: com, created: d, title: t});

		//resets comment form
		$('#new_comment').val('');

		//gets comments and appends to comment list
		get_comments();
	};










	//retrieve comments when there is a new one
	//store in the comments_array
	function get_comments(){
		$('.comments_wrapper').empty();

		comments_obj.on('child_added', function (snapshot) {
		    console.log(snapshot.val().title, "comment in db");

		    var comments = snapshot.val().comment;
		    var users = snapshot.val().user;
		    var created = snapshot.val().created;
		    var avatar = snapshot.val().avatar;

		    //empties arrays
		  	global.comments_array = [];
		  	global.user_array = [];
		  	global.created_array = [];
		  	global.user_avatar_array = [];

		    if(snapshot.val().title == global.current_video){
			  	
			  	//pushes result strings into arrays
			  	global.comments_array.push(comments);
			  	global.user_array.push(users);
			  	global.created_array.push(created);
			  	global.user_avatar_array.push(avatar);

			  
			  	render_comments();
			};
		});
	}; //get_comments()












	
	function set_video(e){
		var this_title = $(this).find('h2').html();
		var this_time = $(this).find('h3').html();
		var this_desc = $(this).find('p').html();

		global.current_video = this_title + ".flv";
		global.new_video = true;

		// flash.stopPlaying();
		play_video();
		get_comments();


		render_info(this_title, this_time, this_desc);
	};










	function get_videos(){

		video_obj.on('child_added', function (snapshot) {
		  
		   	var video_array = [];
		    video_array.push(snapshot.val());

		    //sets first video to current for page load default video
		  	// global.current_video = video_array[0].video + ".flv";
		  	
		  	render_videos(video_array);
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
		if(hour >= 13){
			hour = hour - 12;
			time = hour + ":" + minutes;

			time += "pm";
		}

		return month + "/" + day + "/" + year + " " + time;
	};



//============================Renderers==============================//
	function render_videos(video_array){
		
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
		
	  	for (var k=0;k<global.comments_array.length;k++){
		  	
		  	var s = '<div class="comment">';
		  		s += '<a href="' + global.user_avatar_array[k] + '" data-lightbox="avatar id" ><img src="' + global.user_avatar_array[k] + '" alt="user avatar" /></a>';
		  		s += '<h2>' + global.user_array[k] + '</h2>';
		  		s += '<h3>' + global.created_array[k] + '</h3>';
		  		s += '<p>' + global.comments_array[k] + '</p>';
				s += '</div><!-- /.comment-->';					
									
		  	$('.comments_wrapper').append(s);
		};// for
	};










	function render_info(title, time, desc){
		$('.desc').empty();

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



































