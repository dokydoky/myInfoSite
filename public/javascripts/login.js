$(document).ready(function(){
	//$('.modal-footer button').click(function(){
	$('#OKbutton').click(function(){
		var button = $(this);

		if( button.attr("data-dismiss") != "modal" ){

			var id = $("#uLogin")[0].value;
			var pass = $("#uPassword")[0].value;

			$.post("/login", {id: id, pass: pass}, function(data){
				//var inputs = $('form input');
				var inputs = $('.lgInput');
				//var title = $('.modal-title');
				var title = $('#myModalLabel');
				var progress = $('.progress');
				var progressBar = $('.progress-bar');
		
				if( data.result == 0 ){
					title.empty();
					title.append('<font color="red">'+data.data+'</font>');
				} else{
					inputs.attr("disabled", "disabled");
					button.hide();
					progress.show();
					progressBar.animate({width : "100%"}, 100);
			
					progress.delay(700).fadeOut(300);
			
					button.text("Close")
					.removeClass("btn-primary")
					.addClass("btn-success")
					.blur()
					.delay(1000)
					.fadeIn(function(){
						//title.text("Log in is successful");
						title.empty();
						title.append('<font color="green">'+data.data+'</font>');
						button.attr("data-dismiss", "modal");
					});
				}
			});
		} else{
			location.reload();
		}
	});

	$('#loginButton').click(function(){
		var button = $(this);

		if( !button.attr("data-target") ){
			document.write("<form method=\"GET\" style=\"display: none\" id=\"logoutForm\"></form>");
			document.getElementById("logoutForm").action = "/logout";
			document.getElementById("logoutForm").submit();
			return;
		}
	});

	$('#myModal').on('hidden.bs.modal', function (e) {
		//var inputs = $('form input');
		var inputs = $('.lgInput');
		//var title = $('.modal-title');
		var title = $('#myModalLabel');
		var progressBar = $('.progress-bar');
		//var button = $('.modal-footer button');
		var button = $('#OKbutton');

		inputs.removeAttr("disabled");

		title.text("Log in");

		progressBar.css({ "width" : "0%" });

		button.removeClass("btn-success")
		.addClass("btn-primary")
		.text("Ok")
		.removeAttr("data-dismiss");
	});
});









    
    
    
