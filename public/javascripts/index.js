// handle select item tooltip effect
$(".select-item-title").hover(function(){
	$(".select-item-tooltip").show();
		},function(){
	$(".select-item-tooltip").hide();
});

// function addClassItem(code, name, id, venue, day, start, end){
// 	var tmpl = $('#class-item-tmpl').contents().clone();
// 	$(tmpl).attr("id", id);
// 	$(tmpl).children(".class-info").html(code+'<br>'+venue);
// 	$(tmpl).children(".class-item").css({
// 		"grid-row-start": start,
// 	  "grid-row-end": end,
// 	});
// 	$(".schedule").eq(day).append(tmpl);
// }

// add class item to timetable
function addClassItem(day, start, end){
	var newDiv = document.createElement("div");
	var newItem = document.createElement("div");
	$(newItem).addClass("class-info");
	$(newDiv).addClass("class-item").css({
		"grid-row-start": start,
	    "grid-row-end": end,
	});
	$(newDiv).append(newItem);
	console.log($(".schedule").eq(day).append(newDiv));
}

function addSearchItem(code, name, id, units){
	var tmpl = $('#search-item-tmpl').contents().clone();
	$(tmpl).attr("id", id);
	$(tmpl).on("click", searchClickHandler);
	$(tmpl).children(".search-item-info").html('<span>'+ code +'</span><br>'+ name +'<br><span> '+ units +' Units </span>');
	$(tmpl).children(".search-item-btn").attr("href", "/course/"+code);
	$('#search-list').append(tmpl);
}

function addSelectItem(code, name, unit){
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
			  var courseCode = result.course.classDetails.courseCode
			  var courseName = result.course.classDetails.courseName
			  addClassItem(courseCode, courseName, "CCHH", 1, 1, 2);
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