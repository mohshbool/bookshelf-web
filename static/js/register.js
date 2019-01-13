$(document).ready(function() {
	// Manipulate the DOM to add month of the year dynamically as a select
	let months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
	$("#monthDiv").append("<select name=\"month\" class=\"form-control\" pattern=\"^Month\" id=\"monthP\" required>");
	$("[name=month]").append("<option selected value=\"\" disabled=\"disabled\">Month</option>");
	for (let month of months){
	    $("[name=month]").append(`<option value=\"${month}\">` + month + "</option>");
	}
	$("#monthDiv").append("</select>");

	// Manipulate the DOM to add years 1940 through 2008 dynamically as a select
	$("#yearDiv").append("<select name=\"year\" class=\"form-control\" pattern=\"^Year\" id=\"yearP\" required>");
	$("[name=year]").append("<option selected value=\"\" disabled=\"disabled\">Year</option>");
	for (let i = 2008; i > 1939; i--){
		$("[name=year]").append(`<option value=\"${i}\">` + i + "</option>");
	}
	$("#yearDiv").append("</select>");

	// To configure invalid messages
	var DIVs = ["firstName", "lastName", "email", "username", "password", "confirmation", "day", "monthP", "yearP"];

	// Render invalidity if the condition isn't met by the user
	$(".form-control").each(function(index) {
		let idjQuery = $(`#${DIVs[index]}`);
		let idQuery = document.getElementById(`${DIVs[index]}`);
		idjQuery.on('input', function(){
			// User isn't responding
			if (idQuery.validity.patternMismatch) {
				// Ensure not to duplicate
				if (!idjQuery.parent().has("div").length){
					switch (DIVs[index]){
						case "username":
							idQuery.classList.add("is-invalid");
							idjQuery.parent().append("<div class=\"invalid-feedback\">" + "Usernames must be between 4 and 20 characters" + "</div>");
							break;
						case "password":
							idQuery.classList.add("is-invalid");
							idjQuery.parent().append("<div class=\"invalid-feedback\">" + "Passwords must contain 8 or more characters that are of at least one number, and one uppercase and lowercase letter" + "</div>");
							break;
						case "firstName":
						case "lastName":
							idQuery.classList.add("is-invalid");
							idjQuery.parent().append("<div class=\"invalid-feedback\">" + "Names must be between 3 and 20 characters" + "</div>");
							break;
						case "email":
							idQuery.classList.add("is-invalid");
							idjQuery.parent().append("<div class=\"invalid-feedback\">" + "E-mails must be in the following order: characters@characters.domain" + "</div>");
							break;
					}
				}
			}
			// Remove when the user responds
			else if (idjQuery.parent().has("div").length){
				idQuery.classList.remove("is-invalid");
				idjQuery.parent().children("div.invalid-feedback").remove();
			}
		});
	});
	
	//Make sure password and its confirmation match
	$("#confirmation").on('input', function() {
		checkConfirmation("confirmation", "password");
	});
	$("#password").on('input', function() {
		checkConfirmation("confirmation", "password");
	});


	//Add the 'show password' functionality
	$("#showPassword").on('click', function(){
	    let x = document.getElementById("password");
	    if (x.type === "password") {
        	x.type = "text";
    	}
	    else {
	        x.type = "password";
	    }
	});

	//https://getbootstrap.com/docs/4.1/components/forms/#custom-styles
	(function() {
		'use strict';
		window.addEventListener('load', function() {
			// Fetch all the forms we want to apply custom Bootstrap validation styles to
			var forms = document.getElementsByClassName('needs-validation');
			// Loop over them and prevent submission
			var validation = Array.prototype.filter.call(forms, function(form) {
				form.addEventListener('submit', function(event) {
				if (form.checkValidity() === false) {
					event.preventDefault();
					event.stopPropagation();
				}
				form.classList.add('was-validated');
				}, false);
			});
		}, false);
	})();
});
