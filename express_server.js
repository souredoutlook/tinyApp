const express = require('express');
const app = express();
const PORT = 8080;

const bodyParser = require("body-parser");
const cookieSession = require('cookie-session')
const bcrypt = require('bcrypt')
const saltRounds = 10;

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2'],
}))

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

app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/login/bye');
});

app.get('/register', (req, res) => {
  const id = req.session !== undefined ? req.session["user_id"] : undefined;
  const user = getUser(id, users);
  if (user) {
    res.redirect('/urls')
  } else {
    const templateVars = { 
      message: null,
      user
    };
    res.render('register', templateVars);
  }
});

app.get('/register/:redir', (req, res) => {
  const id = req.session !== undefined ? req.session["user_id"] : undefined;
  const user = getUser(id, users);
  if (user) {
    res.redirect('/urls')
  } else {
    const templateVars = { 
      message: getAlertMessage(req.params.redir),
      user
    };
    res.render('register', templateVars);
  }
});

app.post('/register', (req, res) => {
  const { password, email } = req.body;
  if (email === '' || password === '' || email === undefined || password === undefined) {
    res.redirect('/register/blank')
  } else {
    if (getUser(email, users)) {
      res.redirect('/register/emailExists');
    } else {
      req.session['user_id'] = registerUser(email, password, users).id;
      res.redirect(301, '/urls');
    }
  }
});

app.get('/login', (req, res) => {
  const id = req.session !== undefined ? req.session["user_id"] : undefined;
  const user = getUser(id, users)
  if (user) {
    res.redirect('/urls')
  } else {
    const templateVars = { user, message: null };
    res.render('login', templateVars);
  }
});

app.get('/login/:redir', (req, res) => {
  const id = req.session !== undefined ? req.session["user_id"] : undefined;
  const user = getUser(id, users)
  const templateVars = { user, message: getAlertMessage(req.params.redir) };
  res.render('login', templateVars);
});

app.post('/login', (req, res) => {
  const { password, email } = req.body;
  if (email === '' || password === '' || email === undefined || password === undefined) {
    res.redirect('/login/blank') 
  } else {
    const result = validateUser(email, password, users);
    if (result.error === 'email') {
      res.redirect('/login/noEmail');
    } else if (result.error === 'password') {
      res.redirect('/login/invalidPass');
    } else {
      req.session['user_id'] = result.user.id;
      res.redirect('/urls');
    }
  }
});

app.get('/', (req, res) => {
  const id = req.session !== undefined ? req.session["user_id"] : undefined;
  if (id === undefined) {
    res.redirect('/login/redir')
  } else {
    res.redirect('/urls');
  }
});

app.get('/urls', (req, res) => {
  const id = req.session !== undefined ? req.session["user_id"] : undefined;
  if (id === undefined) {
    res.redirect('/login/redir')
  } else {
    const user = getUser(id, users);
    const templateVars = {
      'randomQuote' : randomQuote,
      urls: urlsForUser(id,urlDatabase),
      user
    };
    res.render("urls_index", templateVars);
  }
});

app.post('/urls', (req, res) => {
  const id = req.session !== undefined ? req.session["user_id"] : undefined;
  if (id === undefined) {
    res.redirect('/login/redir')
  } else {
    const user = getUser(id, users)
    const randomString = generateRandomString(urlDatabase);
    const { longURL } = req.body;
    urlDatabase[randomString] = { longURL, userID: id };
    res.redirect(`/urls/${randomString}`);
  }
});

app.get('/urls/new', (req, res) => {
  const id = req.session !== undefined ? req.session["user_id"] : undefined;
  const user = getUser(id, users);
  if (user) { 
    const templateVars = { user };
    res.render('urls_new', templateVars);
  } else {
    res.redirect('/login/redir')
  }
});


app.post('/urls/:shortURL/delete', (req, res)=>{
  const { shortURL }= req.params;
  const id = req.session !== undefined ? req.session["user_id"] : undefined;
  if (id === undefined) {
    res.redirect('/login/redir')
  } else if (urlsForUser(id, urlDatabase)[shortURL] === undefined) {
    res.redirect(`/urls/${shortURL}`)
  } else {
    delete urlDatabase[shortURL];
    res.redirect('/urls');
  }
});

app.post('/urls/:shortURL', (req, res) => {
  const { shortURL } = req.params;
  const id = req.session !== undefined ? req.session["user_id"] : undefined;
  if (id === undefined) {
    res.redirect('/login/redir')
  } else if (urlsForUser(id, urlDatabase)[shortURL] === undefined) {
    res.redirect(`/urls/${shortURL}`)
  } else {
    const { newURL } = req.body;
    urlDatabase[shortURL] = { longURL: newURL, userID: id };
    res.redirect(`/urls/${shortURL}`);
  }
});

app.get('/urls/:shortURL', (req, res) => {
  const id = req.session !== undefined ? req.session["user_id"] : undefined;
  const user = getUser(id, users);
  const { shortURL } = req.params
  const message = getAlertMessage(user === undefined ? 'redir' :  urlDatabase[shortURL] === undefined ? 'noExist' : urlsForUser(id, urlDatabase)[shortURL] === undefined ? 'badID' : '')
  const templateVars = { 
    'longURL' : urlDatabase[shortURL] !== undefined ? urlDatabase[shortURL].longURL : undefined,
    alert: message,
    shortURL,
    user,
  };
  res.render("urls_show", templateVars);
});


app.get('/u/:shortURL', (req, res) => {
  const { shortURL } = req.params;
  if (urlDatabase[shortURL] === undefined) {
    res.redirect(`/urls/${shortURL}`)
  } else {
    res.redirect(`${urlDatabase[shortURL].longURL}`);
  }
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}!`);
});
