import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const dbConnection = await mongoose.connect(
      `${process.env.MONGODB_URL}/friendsRepo`
    );
    if (dbConnection) {
      console.log("Successfully connected to db server!");
    }
  } catch (err) {
    console.log("db error:=", err);
    process.exit(1); //this is provided by node js
  }
};

export default connectDB;
