import mongoose, { Schema } from 'mongoose';

const PlaylistSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  videos: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Video',
    },
  ],
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
});

const Playlist = mongoose.model('Playlist', PlaylistSchema);
export { Playlist };
