// set global variables
var selectedCourse = {};
var pending = false;
var color_num = 0;
var dayMap = {
	0: "Mon",
	1: "Tue",
	2: "Wed",
 	3: "Thu",
 	4: "Fri",
  5: "Sat" };

// load and save timetable
$(document).ready(function() {
	if(localStorage.getItem("timetable") != null){
	  selectedCourse = JSON.parse(localStorage.getItem("timetable"));
	  console.log(selectedCourse);
	}

  for(var id in selectedCourse){
  	selectCourse(selectedCourse[id].course, selectedCourse[id].select);
  }

  $.when($.ajax({
		contentType: 'application/json',
		url: '/recommend',
		type: 'GET',
		success: function(result) {
			// receive data
		  console.log(result);
		  var courses = result.courses;
		  var list = $('#recommend-list');

		  // add recommend list items
		  for (var key in courses){
		  	var courseCode = courses[key].courseCode + courses[key].sectionCode;
		  	var courseName = courses[key].courseName;
		  	var units = courses[key].classDetails.units;
		  	var id = courses[key]._id;
		  	addSearchItem(courseCode, courseName, id, units, '#recommend-list')
		  }

		  for (var id in selectedCourse){
				$('#'+id).off('click').css("background-color",'var(--main-color-1)');
		  }
		}
	})).done(function(){
		console.log("recommend load finish");
	});

});

$(window).on("unload",function() {
  localStorage.removeItem("timetable");
  localStorage.setItem("timetable", JSON.stringify(selectedCourse));
});

// string format 
String.prototype.format = function() {
  a = this;
  for (k in arguments) {
    a = a.replace("{" + k + "}", arguments[k].toString())
  }
  return a
}

$("body").on("click",function(){
	if(pending){
		$('[data-select=false]').remove();
		pending = false;
	}
});

function optClassHandler(e){
	e.stopPropagation();
	if(pending){
		$('[data-select=false]').remove();
		pending = false;
	}else{
		var id = $(e.currentTarget).attr("data-id");
		var type = $(e.currentTarget).attr("data-type");
		var color = $(e.currentTarget).attr("data-color");

		var courseCode = selectedCourse[id].course.courseCode;
		var courseName = selectedCourse[id].course.courseName;
		for(var i in selectedCourse[id].course.componentDict[type]){
			if(i != selectedCourse[id].select[type]){
				for(var j in selectedCourse[id].course.componentDict[type][i].meetingInfo){
			  	var daysTime = selectedCourse[id].course.componentDict[type][i].meetingInfo[j][0].daysTime;
			  	var venue = selectedCourse[id].course.componentDict[type][i].meetingInfo[j][0].room;
				  addOptClassItem(courseCode, courseName, id, i, type, venue, daysTime.day, daysTime.timeSlot, color);
				}
			}
	  }
		
		console.log(selectedCourse[id]);
		pending = true;
	}
}

function optClassSelectHandler(e){
	e.stopPropagation();
	var id = $(e.currentTarget).attr("data-id");
	var gid = $(e.currentTarget).attr("data-gid");
	var type = $(e.currentTarget).attr("data-type");
	if($(e.currentTarget).data("select") != true){
		$('[data-select=true][data-id='+id+'][data-type='+type+']').remove();
		$('[data-select=false][data-gid='+gid+']').attr("data-select", true);
		$('[data-select=false]').remove();

		$('[data-select=true][data-id='+id+'][data-type='+type+']').off("click");
		$('[data-select=true][data-id='+id+'][data-type='+type+']').on("click",optClassHandler);
		selectedCourse[id].select[type] = gid;
		pending = false

		//change information in select list
		var idx = 0;
		for(var i in selectedCourse[id].course.componentDict[type][gid].meetingInfo){
			var daysTime = selectedCourse[id].course.componentDict[type][gid].meetingInfo[i][0].daysTime
			var venue = selectedCourse[id].course.componentDict[type][gid].meetingInfo[i][0].room
			$('[data-id='+id+'] [data-type='+type+']').find('.select-item-comp-sec span').eq(2*idx).html("<i class='ion-ios-clock-outline'></i> {0}: {1}:30 - {2}:30".format(dayMap[daysTime.day], daysTime.timeSlot.start+7 , daysTime.timeSlot.end+7));
			$('[data-id='+id+'] [data-type='+type+']').find('.select-item-comp-sec span').eq(2*idx+1).html("<i class='ion-ios-location-outline'></i> {0}".format(venue));
			idx ++;
		}
	}
}

// add optional class item
function addOptClassItem(code, name, id, gid, type, venue, day, timeslot, color){
	if(timeslot.start != null && timeslot.end != null){
		var tmpl = $('#class-item-tmpl').contents().clone();
		$(tmpl).attr("data-id", id);
		$(tmpl).attr("data-type", type);
		$(tmpl).attr("data-gid", gid);
		$(tmpl).attr("data-color", color);
		$(tmpl).attr("data-select", false);
		$(tmpl).children(".class-info").html(code+'<br>'+type+gid+'<br>'+venue);
		$(tmpl).css({
			"grid-row-start": timeslot.start.toString(),
		  "grid-row-end": timeslot.end.toString(),
		  "color": "var(--class-color-"+color+"-0)",
	    "border-bottom-color": "var(--class-color-"+color+"-3)",
	    "border-right-color": "var(--class-color-"+color+"-3)",
	    "background-color": "var(--class-color-"+color+"-2)"
		});

		$(tmpl).hover(function(e){
			$(e.currentTarget).css("background-color","var(--class-color-"+color+"-1");
		},function(e){
			$(e.currentTarget).css("background-color","var(--class-color-"+color+"-2");
		});

		$(tmpl).on("click", optClassSelectHandler);
		$(".schedule").eq(day).append(tmpl);
	}
}
// add class item
function addClassItem(code, name, id, gid, type, venue, day, timeslot, opt, color){
	if(timeslot.start != null && timeslot.end != null){
		var tmpl = $('#class-item-tmpl').contents().clone();
		$(tmpl).attr("data-id", id);
		$(tmpl).attr("data-type", type);
		$(tmpl).attr("data-gid", gid);
		$(tmpl).attr("data-color", color);
		$(tmpl).attr("data-select", true);
		$(tmpl).children(".class-info").html(code+'<br>'+type+gid+'<br>'+venue);
		$(tmpl).css({
			"grid-row-start": timeslot.start.toString(),
		  "grid-row-end": timeslot.end.toString(),
		  "color": "var(--class-color-"+color+"-0)",
	    "border-bottom-color": "var(--class-color-"+color+"-3)",
	    "border-right-color": "var(--class-color-"+color+"-3)",
	    "background-color": "var(--class-color-"+color+"-2)"
		});

		

		if(opt){
			$(tmpl).on("click", optClassHandler);
			$(tmpl).hover(function(e){
				$(e.currentTarget).css("background-color","var(--class-color-"+color+"-1");
			},function(e){
				$(e.currentTarget).css("background-color","var(--class-color-"+color+"-2");
			});
		}
		$(".schedule").eq(day).append(tmpl);
	}
}

// add search item
function addSearchItem(code, name, id, units, target){
	var tmpl = $('#search-item-tmpl').contents().clone();
	$(tmpl).attr("id", id);
	$(tmpl).children(".search-item-info").on("click", searchClickHandler);
	$(tmpl).children(".search-item-info").html('<span>'+ code +'</span><br>'+ name +'<br><span> '+ units +' Units </span>');
	$(tmpl).children(".search-item-btn").attr("href", "/search/"+id);
	$(target).append(tmpl);
}

// delete item handler
function deleteItemHandler(e){
	var id = $(e.currentTarget).attr("data-id");
	$('[data-id="'+id+'"]').remove();
	$('#'+id).children(".search-item-info").on("click", searchClickHandler);
	$('#'+id).css("background-color",'white')
	$('#'+id).hover(function(e){
		$(this).css("background-color", "var(--main-color-1)");
	}, function(e){
		$(this).css("background-color", "white");
	});
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
	var id = $(e.currentTarget).parent().attr("id");
	$.ajax({
		contentType: 'application/json',
		data: JSON.stringify({"key": id}),
		url: '/search/detail',
			type: 'POST',
			success: function(result) {
				// receive data
			  console.log(result);
			  var id = result.course._id;
			  var select = {};
			  for(var key in result.course.componentDict){
			  	select[key] = 0;
			  }
			  selectedCourse[id] = {"course": result.course, "select": select};
			  // disable click
				$(e.currentTarget).off('click').parent().css("background-color",'var(--main-color-1)');

				// select the course
				selectCourse(selectedCourse[id].course, selectedCourse[id].select)
			}
	});
}

function selectCourse(course, select){
  var courseCode = course.courseCode + course.sectionCode
  var courseName = course.courseName
  var id = course._id;
  var color = (color_num++)%7;

	var tmpl = $('#select-item-tmpl').contents().clone();
	$(tmpl).find('.select-item-title').html(courseCode+' '+courseName)
	$(tmpl).attr("data-id", id);
	$(tmpl).find('i.delete-btn').attr("data-id", id);
	$(tmpl).find('i.hide-btn').attr("data-id", id);
	$(tmpl).find('a.select-item-info').attr("href", "/search/" + id);

	// add delete and hide handler
	$(tmpl).find('i.delete-btn').on("click", deleteItemHandler);
	$(tmpl).find('i.hide-btn').on("click", hideItemHandler);

	// add tooltip handler
	$(tmpl).find('.select-item-title').hover(function(){
		$('[data-id="'+id+'"] .select-item-tooltip').show();
	},function(){
		$('[data-id="'+id+'"] .select-item-tooltip').hide();
	});

	// add course info to timetable
	for(var key in course.componentDict){
		var component = course.componentDict[key];

		var opt = false;
		if(component.length > 1){
			opt = true;
		}

		var comp_tmpl = $('#select-item-comp-tmpl').contents().clone();
		$(comp_tmpl).find('.select-item-comp-title').html(key);
		$(comp_tmpl).attr("data-type", key);
		for(var i in component[select[key]].meetingInfo){
			var daysTime = component[select[key]].meetingInfo[i][0].daysTime;
	  	var venue = component[select[key]].meetingInfo[i][0].room;
		  addClassItem(courseCode, courseName, id, select[key], key, venue, daysTime.day, daysTime.timeSlot, opt, color);

		  var sec_tmpl = $('#select-item-sec-tmpl').contents().clone();
		  $(sec_tmpl).html('<span><i class="ion-ios-clock-outline"></i> {0}: {1}:30 - {2}:30</span><span><i class="ion-ios-location-outline"></i> {3}</span>'.format(dayMap[daysTime.day], daysTime.timeSlot.start+7 , daysTime.timeSlot.end+7, venue));
		  $(comp_tmpl).children('.select-item-comp-sec').append(sec_tmpl);
		}

		$(tmpl).children('.select-item-tooltip').append(comp_tmpl);
	}

  $("#select-list").append(tmpl);
  console.log(course);
}

// search handler
$('#search-input').on("keyup", function(){
	var keyword = $(this).val();
	if(keyword.length > 0){
		$('#recommend-list').hide();
		$.ajax({
			contentType: 'application/json',
			data: JSON.stringify({"key": keyword}),
			url: '/search',
			type: 'POST',
			success: function(result) {
				// receive data
			  // console.log(result);
			  var courses = result.courses;
			  var list = $('#search-list');

			  // clean search list items
			  $(list).children().remove();
			  $(list).append("<div class='recommend-title'>Search Result</div>");
			  // add search list items
			  for (var key in courses){
			  	var courseCode = courses[key].courseCode + courses[key].sectionCode;
			  	var courseName = courses[key].courseName;
			  	var units = courses[key].classDetails.units;
			  	var id = courses[key]._id;
			  	addSearchItem(courseCode, courseName, id, units, '#search-list');
			  }

			  if(Object.keys(courses).length == 0){
				  $(list).append("<div style='padding: 0.3rem 0.8rem;'>No matching course for <strong>"+keyword+"</strong></div>");
			  }

			  for (var id in selectedCourse){
					$('#'+id).off('click').css("background-color",'var(--main-color-1)');
			  }
			}
		});
	}else{
		$('#search-list').children().remove();
		$('#recommend-list').show();
	}
});

//export handler
$("#export-btn").on("click", function(){
	exportToCal(selectedCourse);
});

//import handler
$("#import-btn").on("click", function(){
	$('#loading').show();
	$.when($.ajax({
		contentType: 'application/json',
		url: '/protected/import',
		type: 'GET',
		success: function(result) {
			// receive data
		  console.log(result);
		  $(".delete-btn").click();
		  result.courses.forEach(function(course){
		  	var id = course._id;
		  	console.log(id)
			  selectedCourse[id] = {"course": course, "select": course.compDictSelected};
				selectCourse(selectedCourse[id].course, selectedCourse[id].select);
		  });
		}
	})).done(function(){
		$('#loading').hide();
	});
});

