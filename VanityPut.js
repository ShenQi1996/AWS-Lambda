"use strict";
const AWS = require("aws-sdk");

const digitsToChar = {
  1: [" "],
  2: ["A", "B", "C"],
  3: ["D", "E", "F"],
  4: ["G", "H", "I"],
  5: ["J", "K", "L"],
  6: ["M", "N", "O"],
  7: ["P", "Q", "R", "S"],
  8: ["T", "U", "V"],
  9: ["W", "X", "Y", "Z"],
  0: [" "],
};

const PhoneCombinations = function (digits) {
  const ans = [];
  const n = digits.length;
  if (n < 1) return ans;
  const dfs = (i, curr) => {
    if (curr.length === n) ans.push(curr);
    else {
      for (const c of digitsToChar[digits[i]]) {
        dfs(i + 1, curr + c);
      }
    }
  };

  dfs(0, "");
  return ans;
};

const findVowel = function (word) {
  const vowel = ["A", "E", "I", "O", "U"];
  for (var i = 0; i < word.length; i++) {
    if (vowel.includes(word[i])) {
      return true;
    }
  }

  return false;
};

const myfilter = function (vanity) {
  console.log("I am in the function" + vanity);
  let newVanity = vanity.filter(
    ele =>
      ele.slice(-1) != "I" ||
      ele.slice(-1) != "U" ||
      ele.slice(-1) != "V" ||
      ele.slice(-1) != "J"
  );

  //2. Every word has at least one vowel (a,e,i,o,u)

  newVanity = newVanity.filter(ele => findVowel(ele));

  return newVanity;
};

exports.handler = async event => {
  const documentClient = new AWS.DynamoDB.DocumentClient({
    region: "us-east-1",
  });

  // TODO implement

  let responsebody = "";
  let statusCode = 0;

  let phone = event.Details.ContactData.CustomerEndpoint.Address;
  //let phone = "+13477577730";
  let newPhone = phone;
  newPhone = newPhone.slice(5);
  let header = phone.slice(1, 5);
  console.log(header);
  let vanity = PhoneCombinations(newPhone);
  vanity = myfilter(vanity);

  const params = {
    TableName: "PhoneNumbers",
    Item: {
      id: phone.slice(1),
      vanityNumber: [
        header + vanity[0],
        header + vanity[1],
        header + vanity[2],
        header + vanity[3],
        header + vanity[4],
      ],
    },
  };

  try {
    const data = await documentClient.put(params).promise();
    responsebody = JSON.stringify(data);
    statusCode = 201;
  } catch (err) {
    responsebody = `Unable to put phoneNumber: ${err}`;
    statusCode = 403;
  }
  const response = {
    statusCode: statusCode,
    body: responsebody,
    phone: phone,
  };
  return response;
};
