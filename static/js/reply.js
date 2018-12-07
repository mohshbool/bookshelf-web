$(document).ready(function() {
    // Ensure the path is /send?sendto=<username>
    console.log(String(window.location.pathname + window.location.search))
    const reg = /\/send\?sendto=\w+/ig
    if (reg.test(String(window.location.pathname + window.location.search))) {

        // Get the the parameter value
        const sendto = getUrlParameter('sendto');

        // Manipulate the DOM to add the reciver's name
        $("div.container").prepend(`<h4>Contact ${sendto}</h4><hr>`)

        // Event listener to clicks
        $("#reply").click(function() {

            // User meets the condtions
            if (!(document.getElementById('message').validity.valueMissing)) {
                const para = {
                    "sendto": sendto,
                    "message": $("#message").val().trim(),
                    "isNotReply": "False"
                };
                // Web request to send the message and return a status
                $.getJSON("/send", para, function(data) {
                    // Alert the user about the message's status
                    if (data.status === "True") {
                        window.location.replace("/");
                        alert("Message Sent!");
                    }
                    else if (data.status === "False") {
                        alert("There was a problem sending the e-mail, please try again later. " +
                                "Possible causes: Problems with the reciver's email.");
                        window.location.replace("/");
                    }
                });
            }
            // User doesn't meet the conditions
            else {
                alert("You have to enter a message")
            }
        });
    }
    // Some kind of error occured
    else {
        alert("Pathway Error! Please try again later.");
        window.location.replace("/");
    }
});