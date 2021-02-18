const express = require('express');
const app = express();
const PORT = 8080; // default port 8080

const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt')
const saltRounds = 10;
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.set('view engine', 'ejs');

const { generateRandomString, randomQuote, getUser, validateUser, registerUser, urlsForUser, getAlertMessage} = require('./helper/functions');

const urlDatabase = { 
  'b2xVn2': { longURL: 'http://www.lighthouselabs.ca', userID: "000000" },
  '9sm5xK': { longURL: 'http://www.google.com', userID: "000000" }
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: bcrypt.hashSync("purple-monkey-dinosaur", saltRounds)
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync("dishwasher-funk", saltRounds)
  },
  "000000": {
    id: "000000",
    email: "test@example.net",
    password: bcrypt.hashSync("test", saltRounds)
  }
};

app.get('/', (req, res) => {
  res.redirect(301,'/urls');
});

app.get('/urls', (req, res) => {
  const id = req.cookies !== undefined ? req.cookies["user_id"] : undefined;
  const user = getUser(id, users);
  const templateVars = {
    'randomQuote' : randomQuote,
    urls: urlsForUser(id,urlDatabase),
    user
  };
  res.render("urls_index", templateVars);
});

app.get('/urls/new', (req, res) => {
  const id = req.cookies !== undefined ? req.cookies["user_id"] : undefined;
  const user = getUser(id, users);
  if (user) { 
    const templateVars = { user };
    res.render('urls_new', templateVars);
  } else {
    res.redirect('/login/redir')
  }
});


app.post('/urls', (req, res) => {
  const randomString = generateRandomString(urlDatabase);
  const { longURL } = req.body;
  const id = req.cookies["user_id"];
  urlDatabase[randomString] = { longURL, userID: id };
  res.redirect(301, `/urls/${randomString}`);
});

app.post('/urls/:shortURL/delete', (req, res)=>{
  let key = req.params.shortURL;
  const id = req.cookies["user_id"];
  if (urlsForUser(id, users)[key] === undefined) {
    res.sendStatus(403) //this should only be possible by curling POST /register endpoint
  } else {
    delete urlDatabase[key];
    res.redirect(301, '/urls');
  }
});

app.post('/urls/:shortURL', (req, res) => {
  const { shortURL } = req.params;
  const id = req.cookies["user_id"];
  if (urlsForUser(id, users)[shortURL] === undefined) {
    res.sendStatus(403) //this should only be possible by curling POST /register endpoint
  } else {
    const { newURL } = req.body;
    urlDatabase[shortURL] = { longURL: newURL, userID: id };
    res.redirect(301, `/urls/${shortURL}`);
  }
});

app.get('/urls/:shortURL', (req, res) => {
  const id = req.cookies !== undefined ? req.cookies["user_id"] : undefined;
  const user = getUser(id, users);
  const { shortURL } = req.params
  const message = getAlertMessage(user === undefined ? 'redir' : urlsForUser(user, users)[shortURL] === undefined ? 'badID' : '')
  const templateVars = { 
    'longURL' : urlDatabase[shortURL].longURL,
    alert: message,
    shortURL,
    user,
  };
  res.render("urls_show", templateVars);
});

app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect(301, '/urls');
});

app.get('/register', (req, res) => {
  const id = req.cookies !== undefined ? req.cookies["user_id"] : undefined;
  const user = getUser(id, users);
  const templateVars = { user };
  res.render('register', templateVars);
});

app.post('/register', (req, res) => {
  const { password, email } = req.body;
  if (email === '' || password === '' || email === undefined || password === undefined) {
    res.sendStatus(400) //this should only be possible by curling POST /register endpoint
  } else {
    if (getUser(email, users)) {
      res.status(400).send('This email has already been used to register an account');
    } else {
      res.cookie('user_id', registerUser(email, password, users).id);
      res.redirect(301, '/urls');
    }
  }
});

app.get('/login', (req, res) => {
  const id = req.cookies !== undefined ? req.cookies["user_id"] : undefined;
  const user = getUser(id, users)
  const templateVars = { user, redir: null };
  res.render('login', templateVars);
});

app.get('/login/:redir', (req, res) => {
  const id = req.cookies !== undefined ? req.cookies["user_id"] : undefined;
  const user = getUser(id, users)
  const templateVars = { user, redir: getAlertMessage(req.params.redir) };
  res.render('login', templateVars);
});

app.post('/login', (req, res) => {
  const { password, email } = req.body;
  if (email === '' || password === '' || email === undefined || password === undefined) {
    res.sendStatus(400) //this should only be possible by curling POST /login endpoint
  } else {
    const result = validateUser(email, password, users);
    if (result.error === "email") {
      res.status(403).send('There is no account registered to this email');
    } else if (result.error === "password") {
      res.status(403).send('Incorrect password');
    } else {
      res.cookie('user_id', result.user.id);
      res.redirect(301, '/urls');
    }
  }
});



app.get('/u/:shortURL', (req, res) => {
  let key = req.params.shortURL;
  res.redirect(`${urlDatabase[key].longURL}`);
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get('/hello', (req, res) => {
  res.send('<html><body>Hello <b>World</b></body></html>\n');
});


app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}!`);
});
