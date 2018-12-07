$(document).ready(function() {
    let container = $(".container-fluid");
    let para = {
		"isFirst": "False",
		"books": 0,
		"isSearch": "True"
	};
	container.append("<div class=\"row\" id=\"card\">");
	let row = $("#card.row");
	$("#q").on('input', function() {
		// Ready up the GET parameters
		para.q = $("#q").val();
		if (para.q.length > 1) {
			// Waiting 90 seconds before making the AJAX request, displaying a 'searching' gif
			setTimeout(function() {
				// Asynchnorus xHTTPRequest to get books that match the search query
				$.getJSON("/getbooks", para, function(data) {
					// Make sure data returned isn't empty
					if (data.length != 0) {
						let i = 0;
						// Iterate over each book, giving each its own card, while ensuring everything else is set up properly
						for (let [dummy, value]  of Object.entries(data)){
							// Ensure to not duplicate the card
							if (!($(`#${value.username}${clean(value.book_name)}`).length)) {
								// Ready up for the next iteration of new cards
								if (i === 0) {
									row.empty();
								}

								// Remove the loading gif
								$("img.loading").remove();

								// Add bootstrap 4 cards with the info plugged into them
								// When the user hasn't entered a descreption, just make the descreption, A book made by <author>
								if (value.author_name && !value.book_descreption) { 
									row.append(
										"<div class=\"col\">"
											+ "<div class=\"card\" style=\"width: 18rem;\">"
												+ "<img class=\"card-img-top\"" + `src=\"${value.image_source}\"`+ "alt=\"Book Picture Unavailable\"" 
													+ "onerror=this.src=\"./media/image_not_available.jpg\">"
												+ "<div class=\"card-body\">"
													+ "<h5 class=\"card-title\">" + `${value.book_name}` + "</h5>"
													+ "<p class=\"card-text\">A book by " + `${value.author_name}.` + "</p>"
													+ "<p class=\"username\">" + `${value.username}` + "</p>"
													+ `<button class=\"btn btn-dark btn-buy ${value.username}${clean(value.book_name)}\">` 
														+ "Buy" + "</button>"
												+ "</div>"
											+ "</div>"
										+ "</div>"
									);
								}
								else {
									row.append(
										"<div class=\"col\">"
											+ "<div class=\"card\" style=\"width: 18rem;\">"
												+ "<img class=\"card-img-top\"" + `src=\"${value.image_source}\"` + "alt=\"Book Picture Unavailable\""
													+ "onerror=this.src=\"./media/image_not_available.jpg\">"
												+ "<div class=\"card-body\">"
													+ "<h5 class=\"card-title\">" + `${value.book_name}` + "</h5>"
													+ "<p class=\"card-text\">" + `${value.book_descreption}.` + "</p>"
													+ "<p class=\"username\">" + `${value.username}` + "</p>"
													+ `<button class=\"btn btn-dark btn-buy ${value.username}${clean(value.book_name)}\">` 
														+ "Buy" + "</button>"
												+ "</div>"
											+ "</div>"
										+ "</div>"
									);
								}
							
								// Adding a modal form and event handlers for each button click
								// Identifier for each modal and its button: usernamebookname
								container.append(
									`<div class="modal fade" tabindex="-1" role="dialog" id="${value.username}${clean(value.book_name)}" 
										aria-labelledby="Buy" aria-hidden="true">
									<div class="modal-dialog modal-dialog-centered" role="document">
										<div class="modal-content">
											<div class="modal-header">
												<h5 class="modal-title">Contact ${value.username}.</h5>
												<button type="button" class="close" data-dismiss="modal" aria-label="Cancel">
													<span aria-hidden="true">&times;</span>
												</button>
											</div>
											<div class="modal-body">
												<form class="needs-validation" novalidate>
													<div class="form-group">
														<textarea id="message" class="form-control ${value.username}${clean(value.book_name)}" 
														placeholder="Ask the owner about the book's condition, price, meetup ..." 
														rows="5" required></textarea>
													</div>
												</form>
											</div>
											<div class="modal-footer">
												<button type="button" class="btn btn-secondary" data-dismiss="modal">Cancel</button>
												<button type="button" class="btn btn-primary btn-send" 
												id="${value.username}${clean(value.book_name)}">Send</button>
											</div>
											</form>
										</div>
									</div>`
								);
								
								// Toggle modal when 'buy' is clicked
								$(`.${value.username}${clean(value.book_name)}.btn-buy`).click(function() {
									
									$(`#${value.username}${clean(value.book_name)}.modal`).modal('toggle');
								});
								
								// Make the send request when 'send' is clicked
								$(`#${value.username}${clean(value.book_name)}.btn-send`).click(function() {
									let sendpara = {
										"sendto": value.username,
										"bookname": value.book_name, 
										"message": $(`#message.${value.username}${clean(value.book_name)}`).val().trim(),
										"isNotReply": "True"
									};
									// Web request to send the message and return a status
									$.getJSON("/send", sendpara, function(data) {
										// Alert the user about the message's status
										if (data.status === "True") {
											alert("Message sent!");
											window.location.replace("/")
										}
										else if (data.status === "False") {
											alert("There was a problem sending the e-mail, please try again later." +
													"Possible causes: Problems with the reciver's email.");
											window.location.replace("/");
										}
									});
								});
								
							}
							i++;
						}
					}
				});
			}, 1500);
		}	
			// Render the 'searching' gif
			if (!($(".card").length) && para.q !== "" && !($("img.loading").length)) {
				container.append(
					"<img src=\"/static/media/loading_icon.gif\" class=\"loading\">"
				);
			}
    	});
	});