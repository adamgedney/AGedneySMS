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

		var source = $(htmlArg).find('#logged_in').html();
		var template = Handlebars.compile(source);
		// var context = {id: posts._id, title:posts.title, created: posts.created, author: posts.author, category: posts.category, text: posts.text}
		// var html = template(context);

		$('#content').append(template);
	});
};







//---------------Transport functionality---------------------------//

//-------------Favorites button------------//
var toggle;
$(document).on('click', '#fav_btn', function(e){
	
	if (!toggle){
		$('#fav_btn').attr('src', 'images/star_y.png');
		toggle = true;
	}else{
		$('#fav_btn').attr('src', 'images/star.png');
		toggle = false;
	}
	
});










});// function