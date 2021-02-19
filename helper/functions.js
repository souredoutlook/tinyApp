const bcrypt = require('bcrypt');
const saltRounds = 10;

const generateRandomString = function(database) {
  let randomNumberArray = [];
  do {
    for (let i = 0; i < 6; i++) {
      randomNumberArray.push(Math.floor(Math.random() * 62));
    }
  } while (database[randomNumberArray.join('')] !== undefined);
  return randomNumberArray.map((element)=>{
    if (element >= 0 && element <= 9) {
      return String.fromCharCode(element + 48); //0-9 gives numbers 0-9
    } else if (element >= 10 && element <= 35) {
      return String.fromCharCode(element + 55); //10-35 gives A-Z
    } else { // 36 - 61 gives a-z
      return String.fromCharCode(element + 61);
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
    `"I'll have a short one"`,
    `"Go shorty, it's your birthday, we gon' party like it's your birthday"`,
    `"Forecast: Shorts weather"`
  ];
  return quotes[Math.floor(Math.random() * quotes.length)];
};

/**
 * 
 * @param {string} value string that contains the email or id of the user you want 
 * @param {object} userDB object
 */
const getUser = function(value, userDB) {
  return Object.values(userDB).find(user => user.id === value || user.email === value);
};

/**
 * 
 * @param {string} email string that contains the email of the user you are validating
 * @param {string} password  string that contains the password of the user you are validating
 * @param {object} userDB object containing user objects
 */
const validateUser = function (email, password, userDB) {
  const user = getUser(email, userDB);
  if (user) {
    if (bcrypt.compareSync(password, user.password)) {
      return { user: user, error: null }
    } else {
      return {user: user, error: "password"}
    }
  } else {
    return { user: null, error: "email" }
  }
};

/**
 * 
 * @param {string} email string that contains the email of the user you are validating
 * @param {string} password  string that contains the password of the user you are validating
 * @param {object} userDB object containing user objects
 */
const registerUser = function(email, password, userDB) {

  const id = generateRandomString(userDB);

  userDB[id] = { id, email, password: bcrypt.hashSync(password, saltRounds) };

  return userDB[id];

};

const urlsForUser = function(id, urlDB) {
  return Object.entries(urlDB).filter(urlObj => urlObj[1].userID === id).reduce((myURLS,entryArray)=>{
    myURLS[entryArray[0]] = entryArray[1]
    return myURLS 
  },{})
};

const getAlertMessage = function(string) {
  const message = {
    redir: "You need to be logged in to do that!",
    badID: "This account does not have permission to make changes to this URL.",
    logout: "Goodbye!",
    noExist: "This Short URL is not in use yet"
  }[string] || null;
  return message;
};

module.exports = { generateRandomString, randomQuote, getUser, validateUser, registerUser, urlsForUser, getAlertMessage };