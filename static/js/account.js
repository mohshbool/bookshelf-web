$(document).ready(function() {
	// Make it possible to change the password from the user's account page

	// Toggle modal on click
	$("#changePassword").on('click', function() {
		$(".modal").modal('toggle');
	});
	// Validation

	// For the old password, only missing value though, the rest is in a post request later
	$("#oldPassword").on('input', function() {
		let idQuery = document.getElementById("oldPassword");
		if (idQuery.validity.valueMissing){
			idQuery.classList.add("is-invalid");
		}
		else {
			idQuery.classList.remove("is-invalid");
		}
	});

	//For the new password
	$("#newPassword").on('input', function() {
		let idjQuery = $("#newPassword");
		let idQuery = document.getElementById("newPassword");
		if (idQuery.validity.patternMismatch){
			if (!(idjQuery.parent().has("div").length)){
				idQuery.classList.add("is-invalid");
				idjQuery.parent().append("<div class=\"invalid-feedback\">"
					+ "Passwords must contain 8 or more characters that are of at least one number, and one uppercase and lowercase letter" + "</div>");
			}
		}
		else if (idjQuery.parent().has("div").length){
			idQuery.classList.remove("is-invalid");
			idjQuery.parent().children("div.invalid-feedback").remove();
		}
	});

	// Ensure password and its confirmation match
	$("#newPasswordConfirmation").on('input', function() {
		checkConfirmation("newPasswordConfirmation", "newPassword");
	});
	$("#newPassword").on('input', function() {
		checkConfirmation("newPasswordConfirmation", "newPassword");
	});

	// User input error handling 
	$("#change").click(function() {
		//if (!document.getElementById("newPassword").validity.patternMismatch && !document.getElementById("oldPassword").validity.valueMissing && !checkConfirmation("newPasswordConfirmation", "newPassword"))
		let para = {
			"isChange": "True",
			"isCheck": "True",
			"oldPassword": $("#oldPassword").val(),
			"newPassword": $("#newPassword").val(),
			"newPasswordConfirmation": $("#newPasswordConfirmation").val()
		};
		$.post("/account", para, function(data, statusText, jqXHR) {
			let response = $.parseJSON(JSON.stringify(data));
			// Alert the user about the message's status
			// Render invalidity if the password given doesn't match the one in the database
			if (response.Status === "oldPasswordDatabaseMismatch"){
				alert("Wrong password");
			}
			else if (response.Status === "success"){
				alert("You changed your password successfully!")
				location.reload();
				sleep(500);
			}
		});
	});
});