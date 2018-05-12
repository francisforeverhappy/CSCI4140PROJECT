$("#login-btn").on("click", function(){
	var sid = $("#sid-input").val();
	var pwd = $("#pwd-input").val();
	$(this).html('<div class="btn-loading-box" id="login-loading-box"><i class="ion-ios-loop"></i></div>');
	$.when($.ajax({
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
	})).done(function(){
		$(this).html('Login');
	});
});
