// handle select item tooltip effect
$(".select-item-title").hover(function(){
	$(".select-item-tooltip").show();
		},function(){
	$(".select-item-tooltip").hide();
});

// add class item to timetable
function addClassItem(code, name, venue, day, start, end){
	var newDiv = document.createElement("div");
	var newItem = document.createElement("div");
	$(newItem).addClass("class-item");
	$(newDiv).addClass("class-container").css({
		"grid-row-start": start,
	    "grid-row-end": end,
	});
	$(newDiv).append(newItem);
	console.log($(".schedule").eq(day).append(newDiv));
}

function addClassList(code, name, unit){
}

function searchClickHandler(event){
	var id = $(event.currentTarget).attr("id");
	console.log(id);
	// $.ajax({
	// 	contentType: 'application/json',
	// 	data: JSON.stringify({"key": id}),
	// 	url: '/search',
	// 		type: 'POST',
	// 		success: function(result) {
	// 			// receive data
	// 		  console.log(result);
	// 		}
	// });
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
  			  	var tmpl = $('#search-item-tmpl').contents().clone();

  			  	$(tmpl).attr("id", id);
  			  	$(tmpl).on("click", searchClickHandler);
  			  	$(tmpl).children(".search-item-info").html('<span>'+ courseCode +'</span><br>'+ courseName +' <span> - '+ units +' Units </span>');
  			  	$(tmpl).children(".search-item-btn").attr("href", "/course/"+courseCode);
						$(list).append(tmpl);
  			  }
  			}
		});
	}else{
		$('#search-list').children().remove();
	}
});