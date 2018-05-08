//log url
var url = document.URL;
console.log(url);

// function Removeclass() {
//     console.log(this);
// }
// document.getElementById('nav-meeting').addEventListener("click",Removeclass);
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