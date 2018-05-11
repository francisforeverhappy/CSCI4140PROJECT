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
