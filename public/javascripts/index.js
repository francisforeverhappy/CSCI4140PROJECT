// handle select item tooltip effect
$(".select-item-title").hover(function(){
	$(".select-item-tooltip").show();
		},function(){
	$(".select-item-tooltip").hide();
});

function addClassItem(code, name, id, venue, day, start, end){
	var tmpl = $('#class-item-tmpl').contents().clone();
	$(tmpl).attr("id", id);
	$(tmpl).children(".class-info").html(code+'<br>'+venue);
	$(tmpl).css({
		"grid-row-start": start,
	  "grid-row-end": end,
	});
	$(".schedule").eq(day).append(tmpl);
}

// // add class item to timetable
// function testaddClassItem(day, start, end){
// 	var newDiv = document.createElement("div");
// 	var newItem = document.createElement("div");
// 	$(newItem).addClass("class-info");
// 	$(newItem).html("heyhey<br>yoyo");
// 	$(newDiv).addClass("class-item").css({
// 		"grid-row-start": start,
// 	    "grid-row-end": end,
// 	});
// 	$(newDiv).append(newItem);
// 	console.log($(".schedule").eq(day).append(newDiv));
// }

function addSearchItem(code, name, id, units){
	var tmpl = $('#search-item-tmpl').contents().clone();
	$(tmpl).attr("id", id);
	$(tmpl).on("click", searchClickHandler);
	$(tmpl).children(".search-item-info").html('<span>'+ code +'</span><br>'+ name +'<br><span> '+ units +' Units </span>');
	$(tmpl).children(".search-item-btn").attr("href", "/course/"+code);
	$('#search-list').append(tmpl);
}

function addSelectItem(code, name, unit){
	var tmpl = $('#select-item-tmpl').contents().clone();
	
}

function searchClickHandler(event){
	var id = $(event.currentTarget).attr("id");
	console.log(id);
	$.ajax({
		contentType: 'application/json',
		data: JSON.stringify({"key": id}),
		url: '/search/detail',
			type: 'POST',
			success: function(result) {
				// receive data
			  console.log(result);
			  var courseCode = result.course.courseCode
			  var courseName = result.course.courseName
			  var id = result.course._id;
			  addClassItem(courseCode, courseName, id, "CCHH", 1, "1", "2");
			}
	});
}

// search handler
$('#search-input').on("keyup", function(){
	var keyword = $(this).val();
	if(keyword.length > 0){
		$.ajax({
			contentType: 'application/json',
			data: JSON.stringify({"key": keyword}),
			url: '/search',
  			type: 'POST',
  			success: function(result) {
  				// receive data
  			  console.log(result);
  			  var courses = result.courses;
  			  var list = $('#search-list');

  			  // clean search list items
  			  $(list).children().remove();
  			  // add search list items
  			  for (var key in courses){
  			  	var courseCode = courses[key].courseCode;
  			  	var courseName = courses[key].courseName;
  			  	var units = courses[key].classDetails.units;
  			  	var id = courses[key]._id;
  			  	addSearchItem(courseCode, courseName, id, units)
  			  }
  			}
		});
	}else{
		$('#search-list').children().remove();
	}
});