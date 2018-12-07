$(document).ready(function() {
    // Redirect to Goodreads<www.goodreads.com>
    $("#search").click(function() {
        q = $("#q").val();
        if (q === "" || q.length <= 1){
            alert("Enter author, name or ISBN to search");
        }
        else{
            window.location.href = `https://www.goodreads.com/search?q=${q}`;
        }
    });
});