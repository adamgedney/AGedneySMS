//@codekit-prepend "jquery-1.10.2.min.js"
//@codekit-prepend "jquery.event.special.js"
//@codekit-prepend "jquery.easing.min.js"
// @codekit-prepend "lightbox-2.6.min.js"
//@codekit-prepend "handlebars-v1.1.2.js" 


//namespace
$(function(){


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







//---------------Transport functionality---------------------------//

//-------------Play/Pause Toggle------------//
var play_toggle;
$(document).on('click', '#play_btn', function(e){
	
	if (!play_toggle){
		$('#play_btn').attr('src', 'images/pause.png');
		play_toggle = true;
	}else{
		$('#play_btn').attr('src', 'images/play.png');
		play_toggle = false;
	}
	
});



//-------------Favorites button------------//
var fav_toggle;
$(document).on('click', '#fav_btn', function(e){
	
	if (!fav_toggle){
		$('#fav_btn').attr('src', 'images/star_y.png');
		fav_toggle = true;
	}else{
		$('#fav_btn').attr('src', 'images/star.png');
		fav_toggle = false;
	}
	
});



//-------Show/Hide mic/cam/rec options------//

//toggle controllers
var cam_toggle;
var mic_toggle;
var rec_toggle;

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
	}else{
		$('#camera_btn').css('opacity', '1');
		$('.transport_popup').fadeOut();
		$('.cam_select').fadeOut();

		cam_toggle = false;
	}
	
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
	}else{
		$('#mic_btn').css('opacity', '1');
		$('.transport_popup').fadeOut();
		$('.mic_select').fadeOut();

		mic_toggle = false;
	}
	
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


//------------Seek Bar Handler----------------//
//sets video seek-bar duration
$('#seek-bar').attr('max', '100');

//updates the video current to to seek bar current value
$(document).on('change', '#seek-bar', function(){
	// video.currentTime = seekBar.value;
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


//experimental click sound on a mouseover
// $(document).on('mouseover', 'a', function(){
// 	new Audio('sounds/click.mp3').play();
// });


});// function