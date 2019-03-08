# Header files (Import all needed libraries)
from flask import Flask, render_template, redirect, request, session, jsonify, flash, abort
from flask_session import Session
from tempfile import mkdtemp
from werkzeug.exceptions import default_exceptions
from werkzeug.security import check_password_hash, generate_password_hash
from werkzeug.utils import secure_filename

import smtplib
from smtplib import SMTP
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

from datetime import datetime
from random import randint
from sqlite3 import connect

import re
import time
import os

from helpers import apology, login_required, allowed_file

# Configure flask app
app = Flask(__name__)

# Configure file handling (save path)
UPLOAD_FOLDER = os.getcwd() + "/static/users_media"
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Configure the database's connection with python
db = connect("website.db", check_same_thread=False)

# Configure the mailing server
myEmail = "<email>"
myPassword = "<password>"
emailServer = SMTP("smtp.gmail.com:587")
emailServer.ehlo()
emailServer.starttls()
emailServer.login(myEmail, myPassword)

# Ensure templates are auto-reloaded
app.config["TEMPLATES_AUTO_RELOAD"] = True

# Ensure responses aren't cached
@app.after_request
def after_request(response):
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    response.headers["Expires"] = 0
    response.headers["Pragma"] = "no-cache"
    return response


# Configure session to use filesystem (instead of signed cookies)
app.config["SESSION_FILE_DIR"] = mkdtemp()
app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"
Session(app)


@app.route("/")
@login_required
def index():
    """Render the index template"""
    # Get data to be sent to the template and check its validity
    user_id = session["user_id"]
    name = db.execute("SELECT first_name FROM users WHERE userId = (?)", [user_id]).fetchone()[0]
    if None in (user_id, name):
        flash("Error in the database")
        return redirect("/")
    
    # Render the template with the data plugged in
    return render_template("index.html", firstName=name)


@app.route("/login", methods=["GET", "POST"])
def login():
    """Log user in"""

    # Forget any user_id
    session.clear()

    # User reached route via POST (as by submitting a form via POST)
    if request.method == "POST":

        # Ensure username was submitted
        if not request.form.get("usernameORemail"):
            flash("Must provide Username or E-mail")
            return redirect("/login")

        # Ensure password was submitted
        elif not request.form.get("password"):
            flash("Must provide Password")
            return redirect("/login")

        if re.match(r"[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,3}$", request.form.get("usernameORemail")):
            # Query database for e-mail
            rows = db.execute("SELECT * FROM users WHERE email = (?)",
                          [request.form.get("usernameORemail")]).fetchone()[0]

            # Ensure username exists and password is correct
            if len(rows) != 1 or not check_password_hash(rows[0]["password"], request.form.get("password")):
                flash("Incorrect E-mail/Password")
                return redirect("/login")

            # Remember which user has logged in
            session["user_id"] = rows[0]["userId"]

            # Redirect user to home page
            return redirect("/")
        else:
            # Query database for username
            rows = db.execute("SELECT userId, password FROM users WHERE username = (?)",
                              [request.form.get("usernameORemail")]).fetchone()

            # Ensure username exists and password is correct
            if not rows:
                flash("Incorrect Username/Password")
                return render_template("login.html")

            elif not check_password_hash(rows[1], request.form.get("password")):
                flash("Incorrect Username/Password")
                return redirect("/login")

            # Remember which user has logged in
            session["user_id"] = rows[0]

            # Redirect user to home page
            return redirect("/")

    # User reached route via GET (as by clicking a link or via redirect)
    else:
        return render_template("login.html")


@app.route("/register", methods=["GET", "POST"])
def register():
    """Register user"""
    if request.method == "POST":
        # Get the whole form 
        firstName = request.form.get("firstName")
        lastName = request.form.get("lastName")
        email = request.form.get("email")
        username = request.form.get("username")
        password = request.form.get("password")
        passwordC = request.form.get("confirmation")
        day = request.form.get("day")
        month = request.form.get("month")
        year = request.form.get("year")

        # Value missing validity check for the whole form
        # If any of the fields is None it will return True for the if statement then returning the apology
        if None in (firstName, lastName, email, username, password, passwordC, day, month, year):
            flash("Error in the register from!")
            return redirect("/register")

        # Ensure form isn't empty
        if not re.match(r"[A-Za-z]{3,20}", firstName):
            flash("Names must be between 3 and 20 English alphabetic characters.")
            return redirect("/register")

        if not re.match(r"[A-Za-z]{3,20}", lastName):
            flash("Names must be between 3 and 20 characters.")
            return redirect("/register")

        # Render an apology if the user’s input is blank or the username already exists.
        nameQ = db.execute("SELECT username FROM users WHERE username = (?)", [username]).fetchone()
        if nameQ:
            if username == nameQ[0]:
                flash("Username already exists!")
                return redirect("/register")
        
        # Ensure form validity using regular expressions
        if not re.match(r"[A-Za-z]{4,20}", username):
            flash("Usernames must be between 4 and 20 English alphabetic characters.")
            return redirect("/register")

        if not re.match(r"[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,3}$", email):
            flash("E-mails must be in the following order: characters@characters.domain")
            return redirect("/register")

        # Render an apology either if the passwords do not match or if it doesn't match the criteria.
        if password != passwordC:
            flash("Password and Confirmation Don't Match!")
            return redirect("/register")
        if not re.match(r"(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}", password):
            flash("Passwords must contain 8 or more characters that are of at least one number, and one uppercase and lowercase letter.")
            return redirect("/register")

        # Make the birthday the acceptable format and get the current time
        birthday = "-".join([day, month, year])
        currentTime = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        # Hash the password for security
        hashed = generate_password_hash(password)

        # Generate a unique userId
        while True:
            userId = randint(0, 4294967295)
            doubleChecking = db.execute("SELECT userId FROM users WHERE userId = (?)", [userId]).fetchone()
            if not doubleChecking:
                break


        # Add the user to the database
        db.execute("INSERT INTO users(userId, first_name, last_name, birthday, username, password, email, date_joined)"
                    "VALUES (?, ?, ?, ?, ?, ?, ?, ?)", [userId, firstName, lastName, birthday, username, hashed, email, currentTime])
        db.commit()

        # Remeber them being logged in
        session["user_id"] = userId

        # Redirect user to home page
        return redirect("/")

    # User reached route via GET (as by clicking a link or via redirect), or any other unsupported methods
    else:
        return render_template("register.html")


@app.route("/logout")
def logout():
    """Log user out"""

    # Forget any user_id
    session.clear()

    # Redirect user to login form
    return redirect("/")


@app.route("/account", methods=["GET", "POST"])
@login_required
def account():
    """ Render a template containing the user's info
        Allow the user to change their password"""

    # Reached via a GET (click or link)
    if request.method == "GET":
        # Get key data to the template
        response = db.execute("SELECT * FROM users WHERE userId = (?)", [session["user_id"]]).fetchone()
        """firstName = response[1]
        lastName = response[2]
        birthday = response[3]
        username = response[4]
        email = response[6]"""
        # Render template with data plugged in
        return render_template("account.html", fullName=response[1] + " " + response[2], birthday=response[3],
                    username=[4], email=[6])
    
    # Reached via the custom POST request via the Javascript to change the password
    elif request.method == "POST":
        
        # Ensure hasn't tried to make this custom request
        if request.form.get("isChange") == "True":
            status = {
                "Status": "success"
            }

            # Get form data and check its validity
            oldPassword = request.form.get("oldPassword")
            newPassword = request.form.get("newPassword")
            newPasswordC = request.form.get("newPasswordConfirmation")
            if None in (oldPassword, newPassword, newPasswordC):
                return abort(401)

            # Get the old password from the database
            oldPasswordHashed = db.execute("SELECT password FROM users where userId = (?)", [session["user_id"]]).fetchone()

            # Ensure old password in the database matches the one entered by the use
            if not check_password_hash(oldPasswordHashed[0], oldPassword):
                status["Status"] = "oldPasswordDatabaseMismatch"

            # Ensure the new password matches the condition using regular expressions
            if re.match(r"(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}", newPassword) == None:
                return abort(401)

            # Ensure old password and new password d match
            if newPassword != newPasswordC:
                return abort(401)

            # Encrypt the password for security
            hashed = generate_password_hash(newPassword)

            # Update the user's password if passed all tests
            db.execute("UPDATE users SET password = (?) WHERE userId = (?)", [hashed, session["user_id"]])
            db.commit()

            # Return the response
            return jsonify(status)

@app.route("/sell", methods=["GET", "POST"])
@login_required
def sell():
    """ Sell a book """

    # Form is submitted via a POST request
    if request.method == "POST":

        # Fetch all form data 
        bookName = request.form.get("bookName")
        authorName = request.form.get("authorName")
        descreption = request.form.get("descreption")

        # Double-check for existence
        if None in (bookName, authorName):
            flash("Book Name, Author Name can't be empty!")
            return redirect("/")
        
        # Ensuring not to accept the form if author's name is unknown and there's no descreption
        if authorName.lower() == "unknown" and not descreption:
            flash("Author Name can't be unkown if descreption is empty!")
            return redirect("/")

        # Fetch the uploaded file
        file = request.files['upload']

        # Ensure the filename isn't empty
        if file.filename == '':
            flash("File name isn't valid")
            return redirect("/")


        # Ensure that the file is not None(null) and from the allowed extensions
        if file and allowed_file(file.filename):

            # Save in UPLOAD_FODLER as "<userId>@<filename>"
            file.save(os.path.join(app.config['UPLOAD_FOLDER'], str(session["user_id"]) + '@' + secure_filename(file.filename)))

            # Configure the path for said file
            path = "/static/users_media/"+ str(session["user_id"]) + '@' + secure_filename(file.filename)

            # Ensure the file doesn't already already exist, or a file with the same name, so no overlapping can happen
            fileQuery = db.execute("SELECT * FROM books WHERE image_source = (?)", [path]).fetchall()
            if fileQuery:
                flash("File already exists or a file exists with the same name, please change the name, then try again")
                return redirect("/")

            # Insert the data into the database
            db.execute("INSERT INTO books (book_name, author_name, image_source, book_descreption, userId) VALUES (?, ?, ?, ?, ?)",
                        [bookName, authorName, path, descreption, session["user_id"]])
            db.commit()

            # Everything works if no exceptions have been raised, let the user know!
            flash('Book successfully added!')

            # Return to home page
            return redirect('/')
        else:
            # Alert the user of the allowed extensions
            flash("Only JPG, JPG, PNG and BMP files are allowed")

            # Return to home page
            redirect("/")
    # User reached via a GET request (click or link)
    else:
        return render_template("sell.html")



@app.route("/terms")
def terms():
    """ Render the terms """
    return render_template("terms.html")


@app.route("/books")
@login_required
def books():
    """ Render the search form """
    return render_template("books.html")


@app.route("/buy", methods=["GET"])
@login_required
def buy():
    """ Render the search form for books to buy """
    return render_template("buy.html")


# Not for the user to enter
@app.route("/getbooks", methods=["GET"])
def getbooks():
    # Get all the arguements
    isFirst = request.args.get("isFirst")
    books = int(request.args.get("books"))
    isSearch = request.args.get("isSearch")
    q = request.args.get("q")

    # Error checking to make sure that the user doesn't enter this
    if None in (isFirst, books, isSearch):
        return redirect("/")
    elif isSearch == "True" and q == None:
        return redirect("/")

    # The variable to be returned
    response = []

    # Database queries to get books for show
    if isFirst == "True" and (q == "False" or q == None):
        bookResponse = db.execute("SELECT book_name, author_name, image_source, book_descreption, userId FROM books" 
                                + " WHERE bookId BETWEEN 1 AND 20 ORDER BY RANDOM() LIMIT 20").fetchall()
        for record in bookResponse:
            # Make it a dictionary so it could be jsonified
            response.append({"book_name": record[0], "author_name": record[1], "image_source": record[2], "book_descreption": record[3]})

    # When scrolling on the home page (responsive)
    elif isFirst == "False" and (q == "False" or q == None):
        bookResponse = db.execute("SELECT book_name, author_name, image_source, book_descreption, userId FROM books" 
                                +" WHERE bookId BETWEEN (?) AND (?) ORDER BY RANDOM() LIMIT 6", [books + 1, books + 6]).fetchall()
        for record in bookResponse:
            if not record:
                return abort(403)
            response.append({"book_name": record[0], "author_name": record[1], "image_source": record[2], "book_descreption": record[3]})

    # Info for buy
    elif isFirst == "False" and (isSearch == "True" or q):
        # Handle q being null
        if not q:
            return abort(403)
        
        # Query for all the books in the database
        BOOK_QUERY = db.execute("SELECT book_name FROM books").fetchall()

        # Variable to be keep track of the substring matches
        matches = []
        
        # Iterate over the books of the database, checking whether q is a substring of it
        for book in BOOK_QUERY:
            # Conversion from tuple to string
            book = ''.join(book)

            # Keep track of the matches
            if q.lower() in book.lower():
                matches.append(book)
                
        # Iterate over the books that match, fetching their data
        for match in matches:
            bookData = db.execute("SELECT book_name, author_name, image_source, book_descreption, userId FROM books WHERE book_name LIKE (?) LIMIT 6",
                                    [match]).fetchall()

            # Iterate over each book's data
            for record in bookData:

                # Get username from userId 
                userResponse = db.execute("SELECT username FROM users WHERE userId = (?)", [record[4]]).fetchone()

                # Make it a dictionary so it could be jsonified
                response.append({"book_name": record[0], "author_name": record[1], "image_source": record[2], "book_descreption": record[3], "username": userResponse[0]})
    # Send the return value in JSON
    return jsonify(response)
    

@app.route("/send", methods=["GET"])
@login_required
def send():
    # Get the reciver's username from the URL
    sendto = request.args.get("sendto")
    isNotReply = request.args.get("isNotReply")

    # Render reply.html if user reached the path by clikcing on the link
    if not isNotReply and sendto:
        return render_template("reply.html")

    # Render send.html if user reached the path by clikcing on the 'send' button on the website, 
    # in other words, reached the path without parameters 
    elif not sendto:
        return render_template("send.html")
    
    else:
        # Get all the form data and do validity checks.
        bookName = request.args.get("bookname")
        formMessage = request.args.get("message")
        if None in (sendto, formMessage):
            return jsonify({"status": "False"})

        # Fetch sender's data from the database
        sender = db.execute("SELECT username FROM users WHERE userId = (?)", [session["user_id"]]).fetchone()[0]
        
        # First message via the buy modal
        if bookName:
            msg = """ 
                <p><b>{}</b> is asking asking about <i>{}.</i></p>
                <hr>
                <p>User's Message:</p>
                <p>&nbsp;&nbsp;{}</p> 
                <hr>
                <p><i>Note that you have to be signed in order to reply to the sender.</i></p>
                <a href=\"{}\">Reply to the sender via this link only</a>
                <br>
                <p><b>Please do NOT reply to this e-mail!</b></p>
                <br>
                """.format(sender, bookName, formMessage, request.url_root + "send?sendto=" + sender)

        # User replied via the link
        elif isNotReply == "False":
            msg = """ 
                <p><b>{}</b> replied to your message.</p>
                <hr>
                <p>User's Message:</p>
                <p>&nbsp;&nbsp;{}</p>
                <hr>
                <p><i>Note that you have to be signed in order to reply to the sender.</i></p>
                <a href=\"{}\">Reply to the sender via this link only</a>
                <br>
                <p><b>Please do NOT reply to this e-mail!</b></p>
                <br>
                """.format(sender, formMessage, request.url_root + "send?sendto=" + sender)

        # User sent via the send page
        else:
            msg = """ 
                <p>User's Message:</p>
                <p>&nbsp;&nbsp;{}</p> 
                <hr>
                <p><i>Note that you have to be signed in order to reply to the sender.</i></p>
                <a href=\"{}\">Reply to the sender via this link only</a>
                <br>
                <p><b>Please do NOT reply to this e-mail!</b></p>
                <br>
                """.format(formMessage, request.url_root + "send?sendto=" + sender)


        receiverEmail = db.execute("SELECT email FROM users WHERE username = (?)", [sendto]).fetchone()[0]
        if not receiverEmail:
            abort(400)

        # Configure e-mail message
        emailObj = MIMEMultipart('alternative')
        subject = "Bookshelf: {} sent you a message\n\n".format(sender)
        emailObj['Subject'] = subject
        emailObj['From'] = myEmail
        emailObj['To'] = receiverEmail
        emailObj.attach(MIMEText(msg, "html"))
        
        # Send the email
        for x in range(3):
            try:
                emailServer.sendmail(myEmail, receiverEmail, emailObj.as_string())
                return jsonify({"status": "True"}) # Success
            except:
                if x == 2: # We tried to send the email, however, it failed three times, aborting.
                    return jsonify({"status": "False"})            
                continue # go to the next iteration
        return jsonify({"status": "False"}) # Failed

def errorhandler(e):
    """Handle error"""
    return apology(e.name, e.code)


# listen for errors
for code in default_exceptions:
    app.errorhandler(code)(errorhandler)
