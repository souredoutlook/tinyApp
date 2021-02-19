const bcrypt = require('bcrypt');
const saltRounds = 10;

/**
 * returns a random string of 6 base 62 characters that is not already in the database
 * @param {object} database
 */
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

/**
 * returns a random quote for the link
 */
const randomQuote = function() {
  const quotes = [
    `'So short I can't believe the ticker symbol isn't GME'`,
    `'The URLs are shortening so be sure to add flour and salt'`,
    `'Error 604: Must be this short to ride'`,
    `'URLs so short they're looking up'`,
    `'Get Shorty'`,
    `'Here for a good time (not a long time)'`,
    `'I'll have a short one'`,
    `'Go shorty, it's your birthday, we gon' party like it's your birthday'`,
    `'Forecast: Shorts weather'`,
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
const validateUser = function(email, password, userDB) {
  const user = getUser(email, userDB);
  if (user) {
    if (bcrypt.compareSync(password, user.password)) {
      return { user: user, error: null };
    } else {
      return {user: user, error: 'password'};
    }
  } else {
    return { user: null, error: 'email' };
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

/**
 * returns urls that belong to the supplied user id
 * @param {string} id
 * @param {object} urlDB an object containing objects
 */
const urlsForUser = function(id, urlDB) {
  return Object.entries(urlDB).filter(urlObj => urlObj[1].userID === id).reduce((myURLS,entryArray)=>{
    myURLS[entryArray[0]] = entryArray[1];
    return myURLS;
  },{});
};

/**
 * returns a string if the param string matches key in message object otherwise returns null
 * @param {string} string
 */
const getAlertMessage = function(param) {
  const message = {
    redir: 'You need to be logged in to do that!',
    badID: 'This account does not have permission to make changes to this URL.',
    bye: 'Goodbye! Hope to see you again shortly!',
    noEmail: 'There is no account registered to this email.',
    emailExists: 'There is already an account registered to this email.',
    invalidPass: 'The password you have entered is incorrect.',
    noExist: 'This Short URL is not in use yet.',
    blank: 'Email address and/or password fields must not be left empty.'
  }[param] || null;
  return message;
};

module.exports = { generateRandomString, randomQuote, getUser, validateUser, registerUser, urlsForUser, getAlertMessage };