// Global Functions

// A function to check the value of two HTML elements by their Id
function checkStrings(str1, str2){
	if ($(`#${str1}`).val() != $(`#${str2}`).val()){
		return false;
		}
	else
		return true;
}

// A function to check mismatch between a password and its confirmation
function checkConfirmation(confirmation, password){
	let idQuery = document.getElementById(confirmation);
	let idjQuery = $(`#${confirmation}`);
	if (!checkStrings(confirmation, password)){
		if (!(idjQuery.parent().has("div").length)){
			idQuery.classList.add("is-invalid");
			idjQuery.parent().append("<div class=\"invalid-feedback\">" + "Password and its confirmation don't match" + "</div>");
		}
	}
	else if (idjQuery.parent().has("div").length){
		idQuery.classList.remove("is-invalid");
		idjQuery.parent().children("div.invalid-feedback").remove();
	}
}

// A function to remove whitespace and non-alphanumeric characters
function clean(param) {
	if (typeof(param) === "string")
		return String(param).replace(/\s*\W/g, "");
	else {
		let arr = [];
		for (let i = 0; i < param.length; i++) {
			arr.push(String(param[i]).replace(/\s*\W/g, ""));
		}
		return arr;
	}
}

// A function to keep the file busy for n milliseconds
//https://stackoverflow.com/a/16873849/10244931
function sleep(milliseconds) {
  let start = new Date().getTime();
  for (let i = 0; i < 1e7; i++) {
    if ((new Date().getTime() - start) > milliseconds){
      break;
    }
  }
}

// A function to fetch a parameter from the URL
//https://stackoverflow.com/a/21903119/10244931
function getUrlParameter(sParam) {
	var sPageURL = window.location.search.substring(1),
			sURLVariables = sPageURL.split('&'),
			sParameterName,
			i;

	for (i = 0; i < sURLVariables.length; i++) {
			sParameterName = sURLVariables[i].split('=');

			if (sParameterName[0] === sParam) {
					return sParameterName[1] === undefined ? true : decodeURIComponent(sParameterName[1]);
			}
	}
};