//log url
var url = document.URL;
console.log(url);

// aside nav function
$('#nav-details,#nav-meeting,#nav-enrollment,#nav-availablity,#nav-comments').on('click',function(e){
    //console.log(this);
    $('#nav-details').parent().removeClass('red_sign');
    $('#nav-meeting').parent().removeClass('red_sign');
    $('#nav-enrollment').parent().removeClass('red_sign');
    $('#nav-availablity').parent().removeClass('red_sign');
    $('#nav-comments').parent().removeClass('red_sign');
    $(this).parent().addClass('red_sign');
});

//comments top or recent
function sortcomments($data,$status){
    if($status!='200'){
        console.log("failure");
    }
    else{

    }
}
$(".comments-sort-list").children().on('click', function (e) {
    $(this).siblings().removeClass("selected");
    $(this).addClass("selected");
    console.log(this);
    console.log($(this).attr('title'));
    $.get($(this).attr('title'),sortcomments);
});

// console.log(courseInfo);
// // var lec_meeting_time = courseInfo.lectures.meetingInfo;
// for (var i = 0; i < courseInfo.lectures.meetingInfo.length; i++){
//     var what_day = courseInfo.lectures.meetingInfo[i].daystime.day;
//     switch (what_day) {
//         case 0:
//             courseInfo.lectures.meetingInfo[i].daystime.day = "Sunday";
//             break;
//         case 1:
//             courseInfo.lectures.meetingInfo[i].daystime.day = "Monday";
//             break;
//         case 2:
//             courseInfo.lectures.meetingInfo[i].daystime.day = "Tuesday";
//             break;
//         case 3:
//             courseInfo.lectures.meetingInfo[i].daystime.day = "Wednesday";
//             break;
//         case 4:
//             courseInfo.lectures.meetingInfo[i].daystime.day = "Thursday";
//             break;
//         case 5:
//             courseInfo.lectures.meetingInfo[i].daystime.day = "Friday";
//             break;
//         case 6:
//             courseInfo.lectures.meetingInfo[i].daystime.day = "Saturday";
//             break;
//     }
// }