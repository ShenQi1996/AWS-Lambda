"use strict";
const AWS = require("aws-sdk");

exports.handler = async (event, context) => {
  const documentClient = new AWS.DynamoDB.DocumentClient({
    region: "us-east-1",
  });

  const digitsToChar = {
    2: ["A", "B", "C"],
    3: ["D", "E", "F"],
    4: ["G", "H", "I"],
    5: ["J", "K", "L"],
    6: ["M", "N", "O"],
    7: ["P", "Q", "R", "S"],
    8: ["T", "U", "V"],
    9: ["W", "X", "Y", "Z"],
  };

  let responsebody = "";
  let statusCode = 0;

  // find the Combinations of a phone number

  let vanity = [];

  let digits = "18002845337"; //phone number

  const header = digits.slice(0, 4);
  const test = digits.slice(-7);
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

  vanity = PhoneCombinations(test);

  //think of a way to check the best 5 combinations.

  //1. English words do not end in I, U, V, or J
  let newVanity = vanity.filter(
    ele =>
      ele.slice(-1) != "I" ||
      ele.slice(-1) != "U" ||
      ele.slice(-1) != "V" ||
      ele.slice(-1) != "J"
  );
  //2. Every word has at least one vowel (a,e,i,o,u)
  newVanity = newVanity.filter(ele => ele.includes("A", "E", "I", "O", "U"));
  //3. Q is always followed by a U (queen)
  // 7 is Q     8 is U
  let test2 = [];
  for (let i = 0; i < newVanity.length; i++) {
    if (newVanity[i].slice(-1) != "Q") {
      if (newVanity[i].includes("Q")) {
        let indexQ = newVanity[i].indexOf("Q");
        if (newVanity[i][indexQ + 1] == "U") {
          test2.push(newVanity[i]);
        }
      } else {
        test2.push(newVanity[i]);
      }
    } else {
      test2.push(newVanity[i]);
    }
  }
  //5. V or J always followed by a E
  let test3 = [];
  for (let i = 0; i < test2.length; i++) {
    if (test2[i].includes("V")) {
      let indexV = test2[i].indexOf("V");
      if (test2[i][indexV + 1] == "E") {
        test3.push(test2[i]);
      }
    } else if (test2[i].includes("J")) {
      let indexJ = test2[i].indexOf("J");
      if (test2[i][indexJ + 1] == "E") {
        test3.push(test2[i]);
      }
    } else {
      test3.push(test2[i]);
    }
  }

  //6. Words can be ended with ing, ed, er, or est

  const params = {
    TableName: "PhoneNumbers",
    Item: {
      id: digits,
      vanityNumber: [
        {
          1: header + "-" + test3[0],
        },
        {
          2: header + "-" + test3[1],
        },
        {
          3: header + "-" + test3[2],
        },
        {
          4: header + "-" + test3[3],
        },
        {
          5: header + "-" + test3[4],
        },
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
    headers: {
      "Content-Type": "application/json",
    },
    body: responsebody,
  };

  return response;
};
