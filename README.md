
# Bookshelf

**Bookshelf** is a website that was my final project for CS50X 2018.

## Used in the creation of this website
* [Python](https://www.python.org/)
* [Javascript](https://www.javascript.com/)
* [jQuery](https://jquery.com/)
* [Bootstrap](https://getbootstrap.com/)
* [Goodreads](https://www.goodreads.com/)

## Dependancies 
- **flask**
- **flask-session**

## Geting started

**_NOTE: If you don't have git, just download the zip file. (skip this step)_**

##### Clone the repository and move into its directory
```
$ git clone https://github.com/Minter27/Bookshelf.git 
$ cd Bookshelf
```

### Installing dependacies

*Please use `pip`*
###### Windows
```
$ pip install flask flask-session
```
###### Mac OS/Linux
```
$ pip3 install flask flask-session
```

### Launching the server

##### Change lines `36` and `37` in `application.py` to the email and password you wish to run the `SMTP` server on. (the email to send the emails from)
```
...
36 | myEmail = yourEmail
37 | myPassword = yourPassword
...
```
#### Set flask app to `application.py`
###### Windows
```
$ set FLASK_APP=application.py
```
###### Mac OS/Linux
```
$ export FLASK_APP=application.py
```
##### Launch the server
```
$ flask run
```
