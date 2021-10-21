"use strict";
const AWS = require("aws-sdk");

exports.handler = async (event, context) => {
  const documentClient = new AWS.DynamoDB.DocumentClient({
    region: "us-east-1",
  });

  let vanity = "";
  let responsebody = "";
  let statusCode = 0;
  let phone = event.Details.ContactData.CustomerEndpoint.Address;
  // const {id} = JSON.parse(event.body);
  //const id = "13477577730";
  let id = phone.slice(1);
  const params = {
    TableName: "PhoneNumbers",
    Key: {
      id: id,
    },
  };
  try {
    const data = await documentClient.get(params).promise();
    responsebody = data.Item.vanityNumber;
    let temp = JSON.stringify(
      responsebody[0] + responsebody[1] + responsebody[3]
    );
    vanity = "here are your 3 vanity numbers" + temp;
    statusCode = 201;
  } catch (err) {
    responsebody = `Unable to get Vanity Numbers: ${err}`;
    statusCode = 403;
  }

  const response = {
    statusCode: statusCode,
    vanity: vanity,
  };

  return response;
};
