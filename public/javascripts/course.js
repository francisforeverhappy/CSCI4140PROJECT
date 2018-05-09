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

// meeting time table
function altRows(id) {
    if (document.getElementsByTagName) {

        var table = document.getElementById(id);
        var rows = table.getElementsByTagName("tr");

        for (i = 0; i < rows.length; i++) {
            if (i % 2 == 0) {
                rows[i].className = "evenrowcolor";
            } else {
                rows[i].className = "oddrowcolor";
            }
        }
    }
}

window.onload = function () {
    altRows('alternatecolor');
}