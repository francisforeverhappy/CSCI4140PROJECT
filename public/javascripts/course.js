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
// function sortcomments($data,$status){
//     if($status!='200'){
//         console.log("failure");
//     }
//     else{

//     }
// }
// $(".comments-sort-list").children().on('click', function (e) {
//     $(this).siblings().removeClass("selected");
//     $(this).addClass("selected");
//     $.get($(this).attr('title'),sortcomments);
// });

// refresh waiting list
$('#refresh-waitingList').on("click", function () {
    var courseId= $('#courseId').text();
    console.log(courseId);
    if (courseId.length > 0) {
        $.ajax({
            contentType: 'application/json',
            data: JSON.stringify({ "courseId": courseId }),
            url: '/protected/getWait',
            type: 'POST',
            success: function (result) {
                // receive data
                console.log(result);
            }
        });
    } else {
        console.log("refresh failure");
    }
});

//update rating
var rating=3;
console.log($('#rating').val());
$('#rating1,#rating2,#rating3,#rating4,#rating5').on('click',function(){
    $('#rating').val($(this).val());
});

//submit comments
$('#submit').on("click", function () {
    var courseId = $('#courseId').text();
    var text = $('#write-comment').val();
    var rating = $('#rating').val();
    console.log(text);
    if (text != '') {
        $.ajax({
            contentType: 'application/json',
            data: JSON.stringify({ "courseId": courseId , "text":text, "rating":rating}),
            url: '/comment/create',
            type: 'POST',
            success: function (result) {
                // receive data
                if(result.success == "false"){
                    alert(result.error);
                }
                else{
                    location.reload();
                }
            }
        });
    } else {
        alert("Comments cannot be empty! Thanks.")
    }
});