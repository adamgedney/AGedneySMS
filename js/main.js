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

var db = new Firebase('https://adamgedney.firebaseio.com/');



// var globalError = function(message){
// 	console.log(message, "error mess");
// }



var connected = function(success, error){
	 console.log(success, error);
	if(success){
		connection_open = true;

		if(recording){
			flash.startRecording(name,cam_index,mic_index);
		}else{
			flash.startPlaying('hhhhh.flv');
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


//scrub can leave its perimeter. broken


//========================Seek Bar=========================//
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











var flashReady = function(){
	
	//sets init volume to 70
	$('#vol_bar').val(100);
	

	//-------------Play/Pause Toggle------------//
	$(document).on('click', '#play_btn', function(e){
		
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
		
	});
};// flashReady()


//set volume
$(document).on('change', function(e){
	
	var vol = $('#vol_bar').val() / 100;
		vol = vol.toFixed(1);

		flash.setVolume(vol);
});














//-------Show/Hide mic/cam/rec options------//

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
	var category = $('#category').val();
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
});

//stop recording button
$(document).on('click', '#stop_rec', function(e){
	flash.stopRecording();
	$('.stop_rec_modal').hide();


	// $('.poster').fadeIn();

});	












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
$(document).on('click', '#login_fb', function(e){

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


	});//get()
});

//Controls logout
$(document).on('click', '#login_state', function(e){

	if($('#login_state').html() == "Logout"){
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
var click;
$(window).scroll(function(e){
	var y_pos = $(document).scrollTop();
	var div_top = $('.body_nav').offset();

	//remove div from document flow and pin to top of window
	//***********put in a toggle o prevent css setting on every pixel scrolled
	if(div_top.top <= y_pos){
		$('.body_nav').css({
			'position' : 'fixed',
			'top' : '0',
			"z-index" : '9999'
		});

		//plays a click as header is pinned
		if(!click){
			var mp3 = new Audio('sounds/click.mp3').play();
			click = true;
		};

		//creates a smoother transition as div leaves document flow
		$('.page').css('marginBottom', '90px');
	}

	//reinstate div's normal position in document.
	if(div_top.top < '749'){
		$('.body_nav').css({
			'position' : 'relative',
			'top' : '0',
			"z-index" : '9999'
		});

		click = false;
		$('.page').css('marginBottom', '0');
	}
});




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










//---------------------------Comment submit---------------------------//
// var messages = db.child('/messages');
// $(document).on('click', '#submit_comment', function(e){
// 	e.preventDefault();
// 	var com = $('#new_comment').val();
// 	var usr = "Mike Miller";

// 	messages.push({user: usr, comment: com});

// 	$('#new_comment').val('');

// });

// db.limit(10).on('child_added', function (snapshot) {
//     // console.log(snapshot.val().comment, "snapshot");
  
//   });



//======================== Firebase ================================//


// myDataRef.set('User ' + name + ' says ' + text);
// myDataRef.set({name: name, text: text});
// myDataRef.push({name: name, text: text});
// myDataRef.on('child_added', function(snapshot) {
  //We'll fill this in later.
  //var message = snapshot.val();
//displayChatMessage(message.name, message.text);
// });

// event types
//Value
//Child Added
//Child Changed
//Child Removed
//Child Moved



























// });// function



