$(document).ready(function() {
    let container = $(".container-fluid");
	let para = {
		"isFirst": "True",
		"books": 20,
		"isSearch": "False"
	}
	container.append("<div class=\"row\">");
	let row = $(".row");
	//Get the first 20 books via a web request
	$.getJSON("/getbooks", para, function(data, statusText, jqXHR){
		let index = 0;
		// Manipulate the DOM to render the response data
		for (let [dummy, value]  of Object.entries(data)){
			if (value.author_name && !value.book_descreption){
				row.append(
					"<div class=\"col\">" 
							+ "<div class=\"card\" style=\"width: 18rem;\">" 
								+ "<img class=\"card-img-top\"" + `src=\"${value.image_source}\"`
								+ "alt=\"Book Picture Unavailable\" onerror=this.src=\"/static/media/image_not_available.jpg\">" 
								+ "<div class=\"card-body\">"
									+ "<h5 class=\"card-title\">" + `${value.book_name}` + "</h5>" 
									+ "<p class=\"card-text\">A book by " + `${value.author_name}.` + "</p>"
								+ "</div>" 
							+ "</div>" 
						+ "</div>"
				);
			}
			else {
				row.append(
					"<div class=\"col\">" 
							+ "<div class=\"card\" style=\"width: 18rem;\">" 
								+ "<img class=\"card-img-top\"" + `src=\"${value.image_source}\"` 
								+ "alt=\"Book Picture Unavailable\" onerror=this.src=\"/static/media/image_not_available.jpg\">" 
								+ "<div class=\"card-body\">"
									+ "<h5 class=\"card-title\">" + `${value.book_name}` + "</h5>" 
									+ "<p class=\"card-text\">" + `${value.book_descreption}.` + "</p>"
								+ "</div>" 
							+ "</div>" 
						+ "</div>")
				;
			}
			index++;
		}
	});
	container.append("</div>");

	//https://stackoverflow.com/a/29720717/10244931
	//Get the rest, responsivly
	let lastScrollTop = 0;
	let allow = true;
	$(window).on('scroll', function() {
		st = $(this).scrollTop();
		//Ensure that the cards are only appended when the scroll is down AND at the bottom of the page
        if(st > lastScrollTop && (window.innerHeight + window.scrollY) >= document.body.offsetHeight && allow) {

			// Edit the parameters to match our goal
			para.isFirst = "False";

			// Web request to get the rest of the books
			$.getJSON("/getbooks", para, function(data){
				
				// Don't allow when the response is null
				if (data.length === 0){
					allow = false;
				}
				container.append("<div class=\"row\">");

				// Manipulate the DOM to render the response data
				for (let [dummy, value]  of Object.entries(data)){
					if (value.author_name && !value.book_descreption){
						row.append("<div class=\"col\">" 
									+ "<div class=\"card\" style=\"width: 18rem;\">" 
										+ "<img class=\"card-img-top\"" + `src=\"${value.image_source}\"` 
										+ "alt=\"Book Picture Unavailable\" onerror=this.src=\"static/media/image_not_available.jpg\">" 
										+ "<div class=\"card-body\">"
											+ "<h5 class=\"card-title\">" + `${value.book_name}` + "</h5>" 
											+ "<p class=\"card-text\">A book by " + `${value.author_name}.` + "</p>"
										+ "</div>" 
									+ "</div>" 
								+ "</div>");
					}
					else {
						row.append("<div class=\"col\">" 
									+ "<div class=\"card\" style=\"width: 18rem;\">" 
										+ "<img class=\"card-img-top\"" + `src=\"${value.image_source}\"` 
										+ "alt=\"Book Picture Unavailable\" onerror=this.src=\"static/media/image_not_available.jpg\">" 
										+ "<div class=\"card-body\">"
											+ "<h5 class=\"card-title\">" + `${value.book_name}` + "</h5>" 
											+ "<p class=\"card-text\">" + `${value.book_descreption}.` + "</p>"
										+ "</div>" 
									+ "</div>" 
								+ "</div>");
					}
				}
				container.append("</div>");
			});
			// Prepare for the next round of books
			para.books += 6;
        }
        lastScrollTop = st;
    });
});
