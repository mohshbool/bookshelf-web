$(document).ready(function() {
    // Validation
    // Ensure user enters book name
    $("#bookName").on('input', function() {
        if (document.getElementById("bookName").validity.valueMissing){
            if (!($("#bookName").parent().has("div").length)){
                document.getElementById("bookName").classList.add("is-invalid");
            }
        }
        else {
            document.getElementById("bookName").classList.remove("is-invalid");
        }
    });

    // Render invalidity on blank author name
    $("#authorName").on('input', function() {
        if (document.getElementById("authorName").validity.valueMissing) {
            if (!($("#authorName").parent().has("div").length)){
                document.getElementById("authorName").classList.add("is-invalid");
            }   
        }
        else {
            document.getElementById("authorName").classList.remove("is-invalid");
        }
    });

    // Ensuring not to accept the form if author's name is unknown and there's no descreption
    document.getElementsByTagName('form')[0].addEventListener('submit', function(event) {
        const reg = /unknown\.*/i;
        // Abort if the condition above is met
        if (reg.test(document.getElementById('authorName').value) && 
            (document.getElementById('descreption').validity.valueMissing || $("#descreption").val() === "")) {
            alert("Author Name can't be unkown if descreption is empty!");
            // Stop form submission
            event.preventDefault();
            event.stopPropagation();
            return false;
        }
    }, false);
});