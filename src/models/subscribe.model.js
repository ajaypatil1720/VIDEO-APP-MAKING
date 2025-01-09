import mongoose, { Schema } from "mongoose";
const SubscribeSchema = mongoose.Schema(
  {
    subscriber: {
      type: Schema.Types.ObjectId, // one who is subscribing
      ref: "User"
    },
    channel: {
      type: Schema.Types.ObjectId, //  one to whom 'subscriber' is subscribing
      ref: "User"
    }
  },
  { timestamps: true }
);

const Subscribe = mongoose.model("Subscribe", SubscribeSchema);
export { Subscribe };
