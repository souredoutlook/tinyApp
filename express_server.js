const express = require('express');
const app = express();
const PORT = 8080; // default port 8080

const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

const urlDatabase = {
  'b2xVn2': 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com'
};

const generateRandomString = function() {
  let randomNumberArray = [];
  do {
    for (let i = 0; i < 6; i++) {
      randomNumberArray.push(Math.floor(Math.random() * 62));
    }
  } while (urlDatabase[randomNumberArray.join('')] !== undefined)
  return randomNumberArray.map((element)=>{
    if (element >= 0 && element <= 9){
      return String.fromCharCode(element + 48); //0-9 gives numbers 0-9
    } else if (element >= 10 && element <= 35) {
      return String.fromCharCode(element + 55); //10-35 gives A-Z
    } else { // 36 - 61 gives a-z
      return String.fromCharCode(element + 61)
    }
  }).join('');
};

const randomQuote = function() {
  const quotes = [
    `"So short I can't believe the ticker symbol isn't GME"`,
    `"The URLs are shortening so be sure to add flour and salt"`,
    `"Error 604: Must be this short to ride"`,
    `"URLs so short they're looking up"`,
    `"Get Shorty"`,
    `"Here for a good time (not a long time)"`,
    `"I'll have a short one"`
  ]
  return quotes[Math.floor(Math.random() * quotes.length)]
};

app.set('view engine', 'ejs');

app.get('/', (req, res) => {
  res.send('Hello!');
});

app.get('/urls', (req, res) => {
  let name = req.cookies !== undefined ? req.cookies["username"] : undefined;
  const templateVars = {
    'randomQuote' : randomQuote,
    urls: urlDatabase,
    username : name
  };
  res.render("urls_index", templateVars);
})

app.get('/urls/new', (req, res) => {
  let name = req.cookies !== undefined ? req.cookies["username"] : undefined;
  const templateVars = { username : name }
  res.render("urls_new", templateVars);
});


app.post('/urls', (req, res) => {
  let randomString = generateRandomString()
  urlDatabase[randomString] = req.body.longURL;
  res.redirect(301, `/urls/${randomString}`)
});

app.post('/urls/:shortURL/delete', (req, res)=>{
  let key = req.params.shortURL;
  delete urlDatabase[key];
  res.redirect(301, '/urls')
});

app.post('/urls/:shortURL', (req, res) => {
  let key = req.params.shortURL;
  urlDatabase[key] = req.body.newURL;
  res.redirect(301, `/urls/${key}`)
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
  let name = req.cookies !== undefined ? req.cookies["username"] : undefined
  const templateVars = {
    'shortURL' : req.params.shortURL,
    'longURL' : urlDatabase[req.params.shortURL],
    username : name
  };
  res.render("urls_show", templateVars);
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
