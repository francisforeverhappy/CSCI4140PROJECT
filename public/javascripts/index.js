// set global variables
var selectedCourse = {};
var pending = false;
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
  // localStorage.removeItem("timetable");
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
		var courseCode = selectedCourse[id].course.courseCode;
		var courseName = selectedCourse[id].course.courseName;

		for(var i in selectedCourse[id].course.componentDict[type]){
			if(i != selectedCourse[id].select[type]){
				for(var j in selectedCourse[id].course.componentDict[type][i].meetingInfo){
			  	var daysTime = selectedCourse[id].course.componentDict[type][i].meetingInfo[j][0].daysTime;
			  	var venue = selectedCourse[id].course.componentDict[type][i].meetingInfo[j][0].room;
				  addOptClassItem(courseCode, courseName, id, i, type, venue, daysTime.day, daysTime.timeSlot);
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
function addOptClassItem(code, name, id, gid, type, venue, day, timeslot){
	if(timeslot.start != null && timeslot.end != null){
		var tmpl = $('#class-item-tmpl').contents().clone();
		$(tmpl).attr("data-id", id);
		$(tmpl).attr("data-type", type);
		$(tmpl).attr("data-gid", gid);
		$(tmpl).attr("data-select", false);
		$(tmpl).children(".class-info").html(code+'<br>'+type+gid+'<br>'+venue);
		$(tmpl).css({
			"grid-row-start": timeslot.start.toString(),
		  "grid-row-end": timeslot.end.toString(),
		});

		$(tmpl).on("click", optClassSelectHandler);
		$(tmpl).addClass("clickable");
		$(".schedule").eq(day).append(tmpl);
	}
}
// add class item
function addClassItem(code, name, id, gid, type, venue, day, timeslot, opt){
	if(timeslot.start != null && timeslot.end != null){
		var tmpl = $('#class-item-tmpl').contents().clone();
		$(tmpl).attr("data-id", id);
		$(tmpl).attr("data-type", type);
		$(tmpl).attr("data-gid", gid);
		$(tmpl).attr("data-select", true);
		$(tmpl).children(".class-info").html(code+'<br>'+type+gid+'<br>'+venue);
		$(tmpl).css({
			"grid-row-start": timeslot.start.toString(),
		  "grid-row-end": timeslot.end.toString(),
		});

		if(opt){
			$(tmpl).on("click", optClassHandler);
			$(tmpl).addClass("clickable");
		}
		$(".schedule").eq(day).append(tmpl);
	}
}

// add search item
function addSearchItem(code, name, id, units){
	var tmpl = $('#search-item-tmpl').contents().clone();
	$(tmpl).attr("id", id);
	$(tmpl).on("click", searchClickHandler);
	$(tmpl).children(".search-item-info").html('<span>'+ code +'</span><br>'+ name +'<br><span> '+ units +' Units </span>');
	$(tmpl).children(".search-item-btn").attr("href", "/search/"+id);
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
			  var id = result.course._id;
			  var select = {};
			  for(var key in result.course.componentDict){
			  	select[key] = 0;
			  }
			  selectedCourse[id] = {"course": result.course, "select": select};
			  // disable click
				$(e.currentTarget).off('click').css("background-color",'linen');

				// select the course
				selectCourse(selectedCourse[id].course, selectedCourse[id].select)
			}
	});
}

function selectCourse(course, select){
  var courseCode = course.courseCode + course.sectionCode
  var courseName = course.courseName
  var id = course._id;

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
		  addClassItem(courseCode, courseName, id, select[key], key, venue, daysTime.day, daysTime.timeSlot, opt);

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
			  // add search list items
			  for (var key in courses){
			  	var courseCode = courses[key].courseCode + courses[key].sectionCode;
			  	var courseName = courses[key].courseName;
			  	var units = courses[key].classDetails.units;
			  	var id = courses[key]._id;
			  	addSearchItem(courseCode, courseName, id, units)
			  }

			  for (var id in selectedCourse){
					$('#'+id).off('click').css("background-color",'linen');
			  }
			}
		});
	}else{
		$('#search-list').children().remove();
	}
});

//export handler
$("#export-btn").on("click", function(){
	exportToCal(selectedCourse);
});

//import handler
$("#import-btn").on("click", function(){
	$('#loading').show();
	$.ajax({
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
	});
	$('#loading').hide();
});

$("#login-btn").on("click", function(){
	var sid = $("#sid-input").val();
	var pwd = $("#pwd-input").val();
	$.ajax({
		contentType: 'application/json',
		url: '/login',
		type: 'POST',
		data: JSON.stringify({"sid": sid, "pwd": pwd}),
		success: function(result) {
			// receive data
			console.log(result);
		  if(result.success){
		  	window.location.reload();
		  }else{
		  	$("#login-warning").show().delay(5000).fadeOut();
		  }
		}
	});
});
