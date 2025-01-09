import mongoose, { Schema } from "mongoose";

const VideoSchema = mongoose.Schema(
  {
    videoFile: {
      type: String //cloudinary url
      // required: true,
    },
    duration: {
      type: Number
      // required: true,
    },
    content: {
      type: String
    },
    title: {
      type: String,
      // required: true,
      lowercase: true
    },
    thumbnail: {
      type: String //cloudinary url
      // required: true,
    },
    views: {
      type: Number,
      default: 0
    },
    description: {
      type: String
      // required: true,
    },
    isPublished: {
      type: Boolean,
      default: true
    },

    owner: {
      type: Schema.Types.ObjectId,
      ref: "User"
    }
  },
  { timestamps: true }
);

const Video = mongoose.model("Video", VideoSchema);
export { Video };
