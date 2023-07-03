const mongoose = require("mongoose");
const { Schema, connection } = mongoose;
const cron = require("node-cron");
const pdf = require("pdf-parse");
fs = require("fs");
const crypto = require("crypto");
const Contract = require("./models/contractModel");
const URI =
  "mongodb+srv://maskondi2000:krishna1234@cluster0.6gtuone.mongodb.net/?retryWrites=true&w=majority";

let verifing_status = {
  initiated: "initiated",
  completed: "completed",
};

let previous_tx = verifing_status.completed;

mongoose
  .connect(URI, {
    useNewUrlParser: true,
  })
  .then(() => run(), console.log("DataBase connection successful"))
  .catch((err) => console.log(err));

async function run() {
  cron.schedule("*/5 * * * * *", async function () {
    console.log("previous_tx status", previous_tx);
    if (previous_tx == verifing_status.completed) {
      await verifyContract();
    } else if (previous_tx == verifing_status.initiated) {
      console.log("waiting for previos tasks to complete");
    }
  });
}

async function verifyContract() {
  console.log("inside cron jon");

  previous_tx = verifing_status.initiated;

  let allRecords = await Contract.find({
    contract_last_verified: { $lte: new Date(Date.now()) },
  });
  console.log("all records", allRecords);

  if (allRecords.length == 0) {
    console.log("inside null");
    previous_tx = verifing_status.completed;
    return;
  }

  let contract_details = allRecords[0];

  let contractId = contract_details.contract_id;

  let dataHash = contract_details.contract_data_hash;

  let filename = contract_details.contract_file_hash;

  let file = `/home/msr/Desktop/nodejs-ocr/uploads/${filename}`; //checking from local

  let buffer = fs.readFileSync(file); //converting file to buffer

  console.log("buffer", buffer);

  let data = await pdf(buffer);

  const hash = crypto.createHash("sha256").update(data.text).digest("hex");

  if (hash != dataHash) {
    console.log("hash not matched "); // time to update value in database
    await hash_not_matched(contractId);
  } else if (hash == dataHash) {
    console.log("hash matched");
    await hash_matched(contractId);
  }
}

async function hash_not_matched(contract_id) {
  let new_date = add_hours(new Date(Date.now()), 24);

  let updated = await Contract.findOneAndUpdate(
    { contract_id: contract_id },
    { is_contract_fabricated: true, contract_last_verified: new_date },
    { new: true }
  );

  previous_tx = verifing_status.completed;
  return;
}

async function hash_matched(contract_id) {
  //update last verified only
  let new_date = add_hours(new Date(Date.now()), 24);

  let updated = await Contract.findOneAndUpdate(
    { contract_id: contract_id },
    { contract_last_verified: new_date },
    { new: true }
  );
  previous_tx = verifing_status.completed;
  return;
}

function add_hours(date, hours) {
  date.setHours(date.getHours() + hours);

  console.log("current date---->", new Date(Date.now()));
  console.log("final date--->", date);
  return date;
}
