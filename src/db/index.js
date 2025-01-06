import mongoose from "mongoose";

const connectDB = async () => {
  try {
    console.log("process.env.MOGODB_URL", process.env.MOGODB_URL);
    const dbConnection = await mongoose.connect(
      `${process.env.MOGODB_URL}/videoTube`
    );
    // console.log("dbConnectiondbConnection", dbConnection);
  } catch (err) {
    console.log("db error:=", err);
    process.exit(1); //this is provided by node js
  }
};

export default connectDB;
