const express = require('express');
const app = express();
const PORT = 8080; // default port 8080

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

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
    `"Eror 604: Must be this short to ride"`,
    `"URLs so short they're looking up"`,
    `"Get Shorty"`]
  return quotes[Math.floor(Math.random() * quotes.length)]
};

app.set('view engine', 'ejs');

app.get('/', (req, res) => {
  res.send('Hello!');
});

app.get('/urls', (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    'randomQuote' : randomQuote
  };
  res.render("urls_index", templateVars);
})

app.get('/urls/new', (req, res) => {
  res.render("urls_new");
});

app.post("/urls", (req, res) => {
  let randomString = generateRandomString()
  urlDatabase[randomString] = req.body.longURL;
  res.redirect(301, `/urls/${randomString}`)
});

app.get('/urls/:shortUrl', (req, res) => {
  const templateVars = {
    'shortURL' : req.params.shortUrl,
    'longURL' : urlDatabase[req.params.shortUrl]
  };
  res.render("urls_show", templateVars);
});

app.get('/u/:shortUrl', (req, res) => {
  let key = req.params.shortUrl;
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
