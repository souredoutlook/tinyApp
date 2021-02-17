const express = require('express');
const app = express();
const PORT = 8080; // default port 8080

const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.set('view engine', 'ejs');

const { generateRandomString, randomQuote } = require('./modules/helper');

const urlDatabase = {
  'b2xVn2': 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com'
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

app.get('/', (req, res) => {
  res.redirect(301,'/urls');
});

app.get('/urls', (req, res) => {
  let name = req.cookies !== undefined ? req.cookies["username"] : undefined;
  const templateVars = {
    'randomQuote' : randomQuote,
    urls: urlDatabase,
    username : name
  };
  res.render("urls_index", templateVars);
});

app.get('/urls/new', (req, res) => {
  let name = req.cookies !== undefined ? req.cookies["username"] : undefined;
  const templateVars = { username : name };
  res.render("urls_new", templateVars);
});


app.post('/urls', (req, res) => {
  let randomString = generateRandomString(urlDatabase);
  urlDatabase[randomString] = req.body.longURL;
  res.redirect(301, `/urls/${randomString}`);
});

app.post('/urls/:shortURL/delete', (req, res)=>{
  let key = req.params.shortURL;
  delete urlDatabase[key];
  res.redirect(301, '/urls');
});

app.post('/urls/:shortURL', (req, res) => {
  let key = req.params.shortURL;
  urlDatabase[key] = req.body.newURL;
  res.redirect(301, `/urls/${key}`);
});

app.post('/login',(req, res) => {
  let { username } = req.body;
  res.cookie('username', username);
  res.redirect(301, '/urls');
});

app.post('/logout',(req, res) => {
  res.clearCookie('username');
  res.redirect(301, '/urls');
});

app.get('/urls/:shortURL', (req, res) => {
  let name = req.cookies !== undefined ? req.cookies["username"] : undefined;
  const templateVars = {
    'shortURL' : req.params.shortURL,
    'longURL' : urlDatabase[req.params.shortURL],
    username : name
  };
  res.render("urls_show", templateVars);
});

app.get('/register', (req, res) => {
  let name = req.cookies !== undefined ? req.cookies["username"] : undefined;
  const templateVars = { username : name };
  res.render("register", templateVars);
});


app.get('/u/:shortURL', (req, res) => {
  let key = req.params.shortURL;
  res.redirect(`${urlDatabase[key]}`);
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
