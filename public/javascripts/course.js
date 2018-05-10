//hide "add comment"
if($('#respond').length==0){
    $('#add-comment').attr('hidden',true);
}

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
                if (result.success == "false") {
                    alert(result.error);
                }
                else {
                    location.reload();
                }
            }
        });
    } else {
        console.log("refresh failure");
    }
});

//update rating
var rating=3;
$('#rating1,#rating2,#rating3,#rating4,#rating5').on('click',function(){
    $('#rating').val($(this).val());
});

//submit comment
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
        alert("Comments cannot be empty! Thanks.");
    }
});
var previous_text;
//Edit
$('#edit').on("click", function () {
    //console.log($('#CommentId').val());
    var authorId = $('#AuthorId').val();
    previous_text = $('#' + authorId).children('.former').children('.comment-content').text();
    $('#'+authorId).children('.former').remove();
    $('#' + authorId).children('.edit-form').css("display","block");
});
//Edit submit comment
$('#edit-submit').on("click", function () {
    var commentId = $('#comment-id').val();
    var text = $('#edit-comment').val();
    var rating = $('#rating').val();
    //console.log(commentId);
    if (text != '') {
        $.ajax({
            contentType: 'application/json',
            data: JSON.stringify({ "commentId": commentId, "text": text, "rating": rating }),
            url: '/comment/edit',
            type: 'POST',
            success: function (result) {
                // receive data
                if (result.success == "false") {
                    alert(result.error);
                }
                else {
                    location.reload();
                }
            }
        });
    } else {
        alert("Comments cannot be empty! Thanks.");
    }
});
//Delete comment
$('#Delete').on("click", function () {
    var commentId = $('#CommentId').val();
    $.ajax({
        contentType: 'application/json',
        data: JSON.stringify({ "commentId": commentId }),
        url: '/comment/delete',
        type: 'POST',
        success: function (result) {
            // receive data
            if (result.success == "false") {
                alert(result.error);
            }
            else {
                location.reload();
            }
        }
    });
});