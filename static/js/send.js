$(document).ready(function() {
    $("button#send").click(function() {
        // Ensure username and message aren't empty
        if (
                (!(document.getElementById('sendto').validity.valueMissing) || $("#sendto").val() !== "")
                &&
                (!(document.getElementById('message').validity.valueMissing) || $("#message").val() !== "")
            ) {
            const para = {
                "sendto": $("#sendto").val(),
                "message": $("#message").val().trim(),
                "isNotReply": "True"
            };
            // Web request to send the message and return a status
            $.getJSON("/send", para, function(data) {
                // Alert the user about the his message's status
                if (data.status === "True") {
                    alert("Message sent!");
                    window.location.replace("/")
                }
                // Some sort of error server-side occured
                else if (data.status === "False") {
                    alert("There was a problem sending the e-mail, please try again later." +
                            "Possible causes: Problems with the reciver's email.");
                    window.location.replace("/");
                }
            });
        }
        // User doesn't meet conditions, usename or message is empty
        else {
            alert("Neither the username nor the message can be empty!");
        }
    });
});