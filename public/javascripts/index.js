var selectedCourse = {};

// string format 
String.prototype.format = function() {
  a = this;
  for (k in arguments) {
    a = a.replace("{" + k + "}", arguments[k].toString())
  }
  return a
}

// add class item
function addClassItem(code, name, id, type, venue, day, timeslot){
	var tmpl = $('#class-item-tmpl').contents().clone();
	$(tmpl).attr("data-id", id);
	$(tmpl).children(".class-info").html(code+'<br>'+type+'<br>'+venue);
	$(tmpl).css({
		"grid-row-start": timeslot.start.toString(),
	  "grid-row-end": timeslot.end.toString(),
	});
	$(".schedule").eq(day).append(tmpl);
}

// add search item
function addSearchItem(code, name, id, units){
	var tmpl = $('#search-item-tmpl').contents().clone();
	$(tmpl).attr("id", id);
	$(tmpl).on("click", searchClickHandler);
	$(tmpl).children(".search-item-info").html('<span>'+ code +'</span><br>'+ name +'<br><span> '+ units +' Units </span>');
	$(tmpl).children(".search-item-btn").attr("href", "/course/"+id);
	$('#search-list').append(tmpl);
}

// delete item handler
function deleteItemHandler(e){
	var id = $(e.currentTarget).attr("data-id");
	$('[data-id="'+id+'"]').remove();
	$('#'+id).on("click", searchClickHandler).css("background-color",'white');
	delete selectedCourse[id];
  console.log(selectedCourse);
}

// hide item handler
function hideItemHandler(e){
	var id = $(e.currentTarget).attr("data-id");
	$('[data-id="'+id+'"].class-item').toggle();
	$(e.currentTarget).toggleClass("ion-ios-eye");
	$(e.currentTarget).toggleClass("ion-ios-eye-outline");
}
// select handler
function searchClickHandler(e){
	var id = $(e.currentTarget).attr("id");
	$.ajax({
		contentType: 'application/json',
		data: JSON.stringify({"key": id}),
		url: '/search/detail',
			type: 'POST',
			success: function(result) {
				// receive data
			  console.log(result);
			  var courseCode = result.course.courseCode + result.course.sectionCode
			  var courseName = result.course.courseName
			  var id = result.course._id;
			  selectedCourse[id] = result.course;
			  console.log(selectedCourse);

			  // disable click
				$(e.currentTarget).off('click').css("background-color",'linen');

				var tmpl = $('#select-item-tmpl').contents().clone();
				$(tmpl).find('.select-item-title').html(courseCode+' '+courseName)
				$(tmpl).attr("data-id", id);
				$(tmpl).find('i.delete-btn').attr("data-id", id);
				$(tmpl).find('i.hide-btn').attr("data-id", id);

				// add delete and hide handler
				$(tmpl).find('i.delete-btn').on("click", deleteItemHandler);
				$(tmpl).find('i.hide-btn').on("click", hideItemHandler);

				// add tooltip handler
				$(tmpl).find('.select-item-title').hover(function(){
					$('[data-id="'+id+'"] .select-item-tooltip').show();
				},function(){
					$('[data-id="'+id+'"] .select-item-tooltip').hide();
				});

				//add lecture info
				if(result.course.lectures.meetingInfo != undefined){
					var lec_tmpl = $('#select-item-lec-tmpl').contents().clone();

			  	for(var i in result.course.lectures.meetingInfo){
				  	var timeSlot = result.course.lectures.meetingInfo[i].daysTime.timeSlot;
					  addClassItem(courseCode, courseName, id, "LEC", "CCHH", i, timeSlot);

					  var sec_tmpl = $('#select-item-sec-tmpl').contents().clone();
					  $(sec_tmpl).html('<span><i class="ion-ios-clock-outline"></i> {0}: {1}:30 - {2}:30</span><span><i class="ion-ios-location-outline"></i> {3}</span>'.format(i, timeSlot.start+7 , timeSlot.end+7, "CCHH"));
					  $(lec_tmpl).children('.select-item-lec-sec').append(sec_tmpl);
				  }

					$(tmpl).children('.select-item-tooltip').append(lec_tmpl);
			  }

				//add tutorial info
			  if(result.course.tutorials.length > 0){
					var tut_tmpl = $('#select-item-tut-tmpl').contents().clone();

			  	for(var i in result.course.tutorials[0].meetingInfo){
				  	var timeSlot = result.course.tutorials[0].meetingInfo[i].daysTime.timeSlot;
					  addClassItem(courseCode, courseName, id, "TUT", "CCHH", 3, timeSlot);

					  var sec_tmpl = $('#select-item-sec-tmpl').contents().clone();
					  $(sec_tmpl).html('<span><i class="ion-ios-clock-outline"></i> {0}: {1}:30 - {2}:30</span><span><i class="ion-ios-location-outline"></i> {3}</span>'.format(3, timeSlot.start+7 , timeSlot.end+7, "CCHH"));
					  $(tut_tmpl).children('.select-item-tut-sec').append(sec_tmpl);
				  }

					$(tmpl).children('.select-item-tooltip').append(tut_tmpl);
			  }

				//add lab info
			  if(result.course.labs.length > 0){
					var lab_tmpl = $('#select-item-lab-tmpl').contents().clone();

			  	for(var i in result.course.labs[0].meetingInfo){
				  	var timeSlot = result.course.labs[0].meetingInfo[i].daysTime.timeSlot;
					  addClassItem(courseCode, courseName, id, "LAB", "CCHH", 4, timeSlot);

					  var sec_tmpl = $('#select-item-sec-tmpl').contents().clone();
					  $(sec_tmpl).html('<span><i class="ion-ios-clock-outline"></i> {0}: {1}:30 - {2}:30</span><span><i class="ion-ios-location-outline"></i> {3}</span>'.format(4, timeSlot.start+7 , timeSlot.end+7, "CCHH"));
					  $(lab_tmpl).children('.select-item-lab-sec').append(sec_tmpl);
				  }

					$(tmpl).children('.select-item-tooltip').append(lab_tmpl);
			  }

			  $("#select-list").append(tmpl);
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
  			  	var courseCode = courses[key].courseCode + courses[key].sectionCode;
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