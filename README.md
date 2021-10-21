# **Vanity_Number_Call_Center**

___
##    **Overview**
![1111](https://user-images.githubusercontent.com/68937006/138316594-b6b118b0-a1c5-408c-b30f-f5f69d63077e.PNG)

**Vanity_Number_Call_Center** Is a serverless program that uses Amazon Web Services(AWS) to create a unique and auto-respond call center experience that will deliver the top three vanity numbers to the caller base on the caller's phone number and store it into the database. 

The user simply just needs to call (1-217-383-0389) to get their vanity numbers.


## **About**
This program is used for people who want to get their vanity number by calling a call center. AWS Connect, AWS Lambda, and DynamoDB will take care of everything. Just call and try it yourself!

## **How does it work?**
Simply just call (1-217-383-0389) on your phone. 

___
##    **Functionality and MVP**

* Use AWS Lambda to find the top 5 vanity numbers and store them into DynamoDB
* AWS Connect setup
* AWS Connect invoke Lambda function
* AWS Lambda function able to get the top three vanity numbers from DynamoDB 
* AWS Connect able to read the top three vanity numbers from the Lambda function.

##    **Technologies**
Vanity_Number_Call_Center utilized AWS Lambda, AWS Connect, and DynamoDB

- **AWS Connect**
  - Set up Omnichannel Cloud Contact Center.
- **AWS Lambda**
  - Serverless event-driven compute service that could run code on any type of application or backend service without thinking or managing servers
- **DynamoDB**
  - Easily scale database 
___

## **Implementation Details**
### AWS Lambda Functions (put / get)

In AWS Lambda put function, I need to take the user's phone from AWS Connect JSON request to get the caller's phone number
```
  let phone = event.Details.ContactData.CustomerEndpoint.Address;
```
After I have the caller's phone number. Then I use the phone number's last 7 numbers to create the combinations.
```
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

  let vanity = PhoneCombinations(newPhone);
```
As you can see in ```digitsToChar``` the number 1 and 0 has nothing in them. That is because is based on an old phone with each number representing 3 to 4 characters in the alphabet.


After getter all the combinations. I have written another set of rules for the combinations. 

The below two filter functions are based on the English rules  (I know there are more but this is what I can do for now.)

```
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

  //1. "I","U","V","J" can not be the last word.
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
```
The last thing we need is to store/get the caller's phone number and the vanity numbers into our DynamoDB
#### Put
```
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

```

#### Get
```
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
```

### DynamoDB

AWS Lambda handles our GET and PUT requests 
![22222](https://user-images.githubusercontent.com/68937006/138329114-40388422-3ee9-472a-ab61-a786862cc40e.PNG)

### AWS Connect

In AWS Connect, the caller will first call the phone number, it will play a prompt then it will run the put Lambda function. It depends on either success or error. It is a success it will read out the caller's phone number then go into the Lambda get function to get the vanity numbers and will play the prompt with the top 3 vanity numbers last out. It is an error, it will play the prompt "Something is wrong with the lambda function" then disconnect the caller. This goes with all errors in AWS Connect.

![3333](https://user-images.githubusercontent.com/68937006/138330360-71e8e029-bc6a-4049-ba74-30bdfed74a2f.PNG)


___

## **Problems I have encounter**

### How to invoke Lambda function 
- Overcome: Read https://docs.aws.amazon.com/connect/latest/adminguide/connect-lambda-functions.html
            Read https://ecs.co.uk/resources/amazon-connect-creating-a-dynamodb-data-dip/
### How to get caller's phone number into my Lambd function
- Overcome: Read https://docs.aws.amazon.com/connect/latest/adminguide/connect-lambda-functions.html (JSON request)
### How to play prompt with dynamic attribute
- Overcome: Read https://docs.aws.amazon.com/connect/latest/adminguide/invoke-lambda-function-block.html
### Learn how to use AWS Lambda, AWS Connect, and DynamoDB
- Overcome: Youtue, projects, and read AWS documentation

___

## **Shortcuts**

#1 ```digitsToChar```as for numbers 1 and 0 I use " " as their char. In production, this will not stay. because my code is set for just getting the last 7 numbers from the caller's phone number, and the last 7 should not be 1 or 0. 

#2 ```PhoneCombinations``` only works with 7 numbers 
#3 ```myfilter``` only have two rules for ```myfilter```. Every word has at least one vowel (a,e,i,o,u), and "I","U","V","J" can not be the last word. There are more rules for an English word out there but these two are the only ones I can come up with. 
#4 AWS Connect Play prompt block: when the caller hears back their phone number from the prompt is not in numbers. (Looking into it)

___

## **Future Updates**
  * Better AWS Connect set up and better way to handle the error. 
  * Able to let the user choose which vanity number to save as their id. 






