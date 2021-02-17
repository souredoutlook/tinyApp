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
    if (user.password === password) {
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

  const id = generateRandomString(email, password, userDB);

  userDB[id] = { id, email, password };

  return userDB[id];

};
module.exports = { generateRandomString, randomQuote, getUser, validateUser, registerUser };