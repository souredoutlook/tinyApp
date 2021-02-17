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
    `"Go shorty, it's your birthday, we gon' party like it's your birthday"`
  ];
  return quotes[Math.floor(Math.random() * quotes.length)];
};

const checkEmail = function(email, userDB) {
  for (let key in userDB) {
    if (userDB[key].email === email) {
      return true;
    }
  }
  return false;
};

const checkPassword = function(bodyObj, userDB) {
  if (Object.values(userDB).find(user => user.password === bodyObj.password && user.email === bodyObj.email)) {
    return true;
  }
  return false;
};

const getID = function(email, userDB) {
  return Object.values(userDB).find(user => user.email === email).id;
}
module.exports = { generateRandomString, randomQuote, checkEmail, checkPassword, getID };