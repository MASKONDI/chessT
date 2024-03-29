const express = require("express");
const app = express();
const multer = require("multer");
const bodyParser = require("body-parser");
const crypto = require("crypto");
const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
const gclteams = require("./gclteams.json");
const { MongoClient, ServerApiVersion } = require('mongodb');


//const { BlockchainUtils } = require('./blockchainutils/blockchainutils');
//const blockchainUtils = new BlockchainUtils();


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//const uri = "mongodb+srv://maskondi2000:krishna1234@cluster0.6gtuone.mongodb.net/?retryWrites=true&w=majority";
const uri = 'mongodb://10.7.24.210:27017';
const dbName ='ChessT';
const collectionName = 'contractrec';
let collection;
MongoClient.connect(uri, { useNewUrlParser: true })
.then(client => {
  const db = client.db(dbName);
   collection = db.collection(collectionName);
  console.log("connection establish")
}).catch(error => console.error(error));


// const client = new MongoClient(uri, {
//   serverApi: {
//     version: ServerApiVersion.v1,
//     strict: true,
//     deprecationErrors: true,
//   }
// });
// async function run() {
//   try {
//     await client.connect();
//     await client.db(dbName).command({ ping: 1 });
//     console.log("Pinged your deployment. You successfully connected to MongoDB!");
//   } finally {
    
//     //await client.close();
//   }
// }
// run().catch(console.dir);


let contractJson;
let contractDetails;
let contractID;

/*******************************************************************************/
/* **************Create Contract Api With Upload Feature*********************/
/*******************************************************************************/


const storage = multer.diskStorage({
  destination: "./uploads",
  filename: (req, file, cb) => {
    // Generate a unique filename using a hash
    if (file.mimetype == "application/pdf") {
      const hash = crypto
        .createHash("sha256")
        .update(file.originalname)
        .digest("hex");
      const ext = path.extname(file.originalname);
      const filename = `${hash}`;
      cb(null, filename);
    } else {
      cb("Error: Only PDF files are allowed");
    }
  },
});

const upload = multer({ storage });


app.post("/upload", upload.single("file"), (req, res) => {

   contractID = uuidv4().replace(/-/g, "").substring(0, 16);
  const contractFile = req.file.filename;
  

  if (req.body.contractType == "Team") {
   
    contractDetails = {
      contractID:contractID,
      contractFile:contractFile,
      contractType:req.body.contractType,
      teamName:req.body.teamName,
      contractWith:req.body.contractWith,
      uploadedBy:req.body.uploadedBy,
      recordDate:req.body.recordDate,
      status:req.body.status,
      actionBy:req.body.actionBy,
      actionDate:req.body.actionDate,
      comment:req.body.comment,
    };
    collection
    .insertOne(contractDetails)
    .then(() => {
      res.status(200).json({ message: "Contract created successfully" , filename: fileName });
    })
    .catch((error) => {
      console.error('Error uploading data:', error);
      res.status(500).send('Internal Server Error');
    });
    console.log("**************************contractDetails********",contractDetails);
    //addTeamContract(contractDetails);
  }
  if (req.body.contractType == "Player") {
    
    contractDetails = {
      contractID :contractID,
      contractFile:contractFile,
      contractType:req.body.contractType,
      playerName:req.body.playerName,
      teamName:req.body.teamName,
      contractWith:req.body.contractWith,
      uploadedBy:req.body.uploadedBy,
      recordDate:req.body.recordDate,
      status:req.body.status,
      actionBy:req.body.actionBy,
      actionDate:req.body.actionDate,
      comment:req.body.comment,
    };
    collection
    .insertOne(contractDetails)
    .then(() => {
      res.status(200).json({ message: "Contract created successfully" , filename: fileName });
    })
    .catch((error) => {
      console.error('Error uploading data:', error);
      res.status(500).send('Internal Server Error');
    });
    //addPlayerContract(contractDetails);
  }
  if (req.body.contractType == "Sponser") {
  
    contractDetails = {
      contractID:contractID,
      contractFile:contractFile,
      contractType:req.body.contractType,
      sponserName:req.body.sponserName,
      contractWith:req.body.contractWith,
      uploadedBy:req.body.uploadedBy,
      recordDate:req.body.recordDate,
      status:req.body.status,
      actionBy:req.body.actionBy,
      actionDate:req.body.actionDate,
      comment:req.body.comment
    };
    collection
    .insertOne(contractDetails)
    .then(() => {
      res.status(200).json({ message: "Contract created successfully" , filename: fileName });
    })
    .catch((error) => {
      console.error('Error uploading data:', error);
      res.status(500).send('Internal Server Error');
    });
    //addSponserContract(contractDetails);
  }
  if (req.body.contractType == "Vendor") {
    contractDetails = {
      contractID:contractID,
      contractFile:contractFile,
      contractType: req.body.contractType,
      vendorName: req.body.vendorName,
      contractWith: req.body.contractWith,
      uploadedBy: req.body.uploadedBy,
      recordDate: req.body.recordDate,
      status: req.body.status,
      actionBy: req.body.actionBy,
      actionDate: req.body.actionDate,
      comment: req.body.comment
    };
    collection
    .insertOne(contractDetails)
    .then(() => {
      res.status(200).json({ message: "Contract created successfully" , filename: fileName });
    })
    .catch((error) => {
      console.error('Error uploading data:', error);
      res.status(500).send('Internal Server Error');
    });
    //addVendorContract(contractDetails);
  }
  fileName = req.file.filename;

  // if (req.file) {
  //   res.status(200).json({ message: "Contract created successfully" , filename: fileName });
  // } else {
  //   res.status(400).json({ error: "No file provided" });
  // }
});


/*******************************************************************************/
/* **************Fetch  Player List****************************************/
/*******************************************************************************/

app.get("/getPlayersList", (req, res) => {
  res.json(gclteams.players);
});


/*******************************************************************************/
/* **************Fetch Teams  List****************************************/
/*******************************************************************************/
app.get("/getTeamsList", (req, res) => {
  res.json(gclteams.teams);
});



/*******************************************************************************/
/* **************Login API with user,pmo,admin**********************************/
/*******************************************************************************/
app.post("/login", (req, res) => {
  const { username, password, role } = req.body;
  const users = require("./users.json");
  const user = users.find(
    (user) => user.username === username && user.password === password && user.role=== role
  );

  if (user) {
    res.json({
      message: "Login successful",
      fullname: user.fullname,
      username: user.username,
      role: user.role,
      access: user.access,
    });
  } else {
    res.status(401).json({ error: "Invalid credentials" });
  }
});


/*******************************************************************************/
/* **************fetch all Contract from DB**********************************/
/*******************************************************************************/

app.get("/contractList", async (req, res) => {

  collection
        .find({})
        .toArray()
        .then((records) => {
          console.log("JSON Records",records);
          res.status(200).json(records);
        })
        .catch((error) => {
          console.error('Error fetching records:', error);
          res.status(500).send('Internal Server Error');
        });
  //************query to fetch all */

  // var data1 =  await GetData();    
  //  res.json(data1);;

  // res.json({
  //   message: `file retrieve successfully`,
  //   contractList: contractList,
  // });
});



/*******************************************************************************/
/* **************Update Contract Status, actionBy, actionDate, comment**********************************/
/*******************************************************************************/



app.post("/updateContractStatus", (req, res) => {
 

  let current = new Date();
  const actionDate = current.toISOString().slice(0,10);

  collection.updateOne( 
    { "contractID": req.body.contractId },
      { $set: { "status":  req.body.status,"actionBy": req.body.actionBy,'actionDate':actionDate,'comment':req.body.comment } })
  .then((result) => {
    if (result.modifiedCount > 0) {
      res.status(200).json({ message: "Contract Status updated successfully"  });
    } else {
      res.status(404).send('contract not found');
    }
  })
  .catch((error) => {
    console.error('Error updating record:', error);
    res.status(500).send('Internal Server Error');
  });
  const contractDetails = req.body;
  console.log("*********req.body",contractDetails);
  //approveStatus(actionDate,contractDetails);
 
  // res.json({
  //   message: `Contract status updated successfully.`,
  // });
});

/*******************************************************************************/
/* **************View File**********************************/
/*******************************************************************************/




// Define a route for fetching a file
app.get("/fetchContract/:filename", (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, "uploads", filename);
  console.log("filePath : ", filePath);
  if (fs.existsSync(filePath)) {
    const fileData = fs.readFileSync(filePath, "utf-8");
    res.json({ fileData });
  } else {
    res.status(404).json({ error: "File not found" });
  }
});


/*******************************************************************************/
/* **************  Storing Data Set into The Blockchain**********************************/
/*******************************************************************************/



async function addTeamContract(contractDetails) {
console.log('$$$$$$$$$$');
  try {
    contractJson = JSON.stringify(contractDetails);
    console.log(contractJson);
    console.log(contractID);
    //const contract = await blockchainUtils.createInstance('User1','teamcontractCC');
    //const bufferResponse = await contract.submitTransaction('AddTeamContract',contractID.toString('utf-8'), contractJson);
    console.log("bufferResponse*****************",bufferResponse);
  } catch (error) {
    console.log("error", error);
  }
}
async function addPlayerContract(contractDetails) {
 

  try {
    contractJson = JSON.stringify(contractDetails);
    //const contract = await blockchainUtils.createInstance('User1','playercontractCC');
    //const bufferResponse = await contract.submitTransaction('AddPlayerContract',contractID.toString('utf-8'), contractJson);
  } catch (error) {
    console.log("error", error);
  }
}
async function addSponserContract(contractDetails) {

  try {
    contractJson = JSON.stringify(contractDetails);
    console.log(contractJson);
    console.log(contractID);
    //const contract = await blockchainUtils.createInstance('User1','sponsercontractCC');
    //const bufferResponse = await contract.submitTransaction('AddSponserContract',contractID.toString('utf-8'), contractJson);;
  } catch (error) {
    console.log("error", error);
  }
}
async function addVendorContract(contractDetails) {

  try {
    contractJson = JSON.stringify(contractDetails);
    console.log(contractJson);
    console.log(contractID);
    //const contract = await blockchainUtils.createInstance('User1','vendorcontractCC');
    //const bufferResponse = await contract.submitTransaction('AddVendorContract',contractID.toString('utf-8'), contractJson);
  } catch (error) {
    console.log("error", error);
  }
}


/*******************************************************************************/
/* **************  Approve Status on Data Set into The Blockchain**********************************/
/*******************************************************************************/




async function approveStatus(actionDate, contractDetails) {
  console.log("contractStatus,contractId,actionBy,comment",contractDetails,actionDate);
  if(contractDetails.contractType == "Team"){
    try {
      const contract = await blockchainUtils.createInstance('User1','teamcontractCC');
      await contract.submitTransaction('ApproveTeamContract',contractDetails.contractId.toString('utf-8'),contractDetails.contractStatus.toString('utf-8'), contractDetails.actionBy.toString('utf-8'), actionDate, contractDetails.comment.toString('utf-8'));
    } catch (error) {
      console.log("error", error);
    }
  }
  if(contractDetails.contractType == "Sponser"){
    try {
      //const contract = await blockchainUtils.createInstance('User1','sponsercontractCC');
      //await contract.submitTransaction('ApproveSponserContract',contractDetails.contractId.toString('utf-8'),contractDetails.contractStatus.toString('utf-8'), contractDetails.actionBy.toString('utf-8'), actionDate, contractDetails.comment.toString('utf-8'));
    } catch (error) {
      console.log("error", error);
    }
  }
  if(contractDetails.contractType == "Player"){
    try {
      //const contract = await blockchainUtils.createInstance('User1','playercontractCC');
      //await contract.submitTransaction('ApprovePlayerContract',contractDetails.contractId.toString('utf-8'),contractDetails.contractStatus.toString('utf-8'), contractDetails.actionBy.toString('utf-8'), actionDate, contractDetails.comment.toString('utf-8'));
    } catch (error) {
      console.log("error", error);
    }
  }
  if(contractDetails.contractType == "Vendor"){
    try {
      //const contract = await blockchainUtils.createInstance('User1','vendorcontractCC');
      //await contract.submitTransaction('ApproveVendorContract',contractDetails.contractId.toString('utf-8'),contractDetails.contractStatus.toString('utf-8'), contractDetails.actionBy.toString('utf-8'), actionDate, contractDetails.comment.toString('utf-8'));
    } catch (error) {
      console.log("error", error);
    }
  }
 
}

async function GetData(){
  
  const teamcontract = await blockchainUtils.createInstance('User1','teamcontractCC');
  const teamHlfResponse = await teamcontract.evaluateTransaction('GetAllContract');
  console.log("bufferResponse", teamHlfResponse);
  var teamData = JSON.parse(hlfResponse.toString('utf-8'));

  const playercontract = await blockchainUtils.createInstance('User1','playercontractCC');
  const playerHlfResponse = await playercontract.evaluateTransaction('GetAllContract');
  //console.log("bufferResponse", hlfResponse);
  var playerData = JSON.parse(playerHlfResponse.toString('utf-8'));

  const sponserContract = await blockchainUtils.createInstance('User1','sponsercontractCC');
  const sponserHlfResponse = await sponserContract.evaluateTransaction('GetAllContract');
  //console.log("bufferResponse", hlfResponse);
  var sponserData = JSON.parse(sponserHlfResponse.toString('utf-8'));

  const vendorcontract = await blockchainUtils.createInstance('User1','vendorcontractCC');
  const vendorHlfResponse = await vendorcontract.evaluateTransaction('GetAllContract');
  //console.log("bufferResponse", hlfResponse);
  var vendorData = JSON.parse(vendorHlfResponse.toString('utf-8'));
 
  const jsonArray = [teamData, playerData,sponserData,vendorData];
  const allData = JSON.stringify(jsonArray);
 // console.log("Keys", data.Id)
  return allData;
}
app.delete('/deleteAllContractDetails', (req, res) => {
  // Delete all records in the collection
  collection
    .deleteMany({})
    .then((result) => {
      res.status(200).send(`Deleted ${result.deletedCount} records`);
    })
    .catch((error) => {
      console.error('Error deleting records:', error);
      res.status(500).send('Internal Server Error');
    });
});
// Start the server
app.listen(8080, () => {
  console.log("Server started on port 8080");
});
