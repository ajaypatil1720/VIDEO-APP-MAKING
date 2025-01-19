import { asyncHandler } from '../utils/AsyncHandler.js';
import { Playlist } from '../models/playlist.model.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import mongoose from 'mongoose';
// this is by me
// const createNewPlaylist = asyncHandler(async (req, res) => {
//   const { name, description } = req.body;

//   const { videoId } = req.params;

//   let playlist = await Playlist.create({
//     name,
//     description,
//     videos: [videoId],
//   });
//   console.log(playlist);

//   if (!playlist) {
//     throw new ApiError(400, 'playlist is not created');
//   }

//   return res.status(200).json(new ApiResponse(200, playlist, 'Playlist created succesfully'));
// });

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  let playlist = await Playlist.create({
    name,
    description,
    owner: req?.user?._id,
  });

  if (!playlist) {
    throw new ApiError(400, 'playlist is not created');
  }

  return res.status(200).json(new ApiResponse(200, playlist, 'Playlist created succesfully'));
});

//get user playlists
const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const playList = await Playlist.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(userId),
      },
    },
    {
      $addFields: {
        videos: {
          $size: '$videos',
        },
      },
    },
  ]);

  console.log('playList is::=', playList);

  return res.status(200).json(new ApiResponse(200, playList, 'Videos added successfully in playlist'));
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;

  //   const playListVideos = await Playlist.aggregate([
  //     {
  //       $match: {
  //         _id: new mongoose.Types.ObjectId(playlistId),
  //       },
  //     },
  //     {
  //       $lookup: {
  //         from: 'videos',
  //         localField: 'videos',
  //         foreignField: '_id',
  //         as: 'videos',
  //         pipeline: [
  //           {
  //             $lookup: {
  //               from: 'users',
  //               localField: 'owner',
  //               foreignField: '_id',
  //               as: 'userDetails',
  //               pipeline: [
  //                 {
  //                   $project: {
  //                     username: 1,
  //                     avatar: 1,
  //                     email: 1,
  //                   },
  //                 },
  //               ],
  //             },
  //           },
  //         ],
  //       },
  //     },

  //     // {
  //     //   $unwind: {
  //     //     path: '$videos', // Unwind the 'videos' array to get each video ID separately
  //     //     preserveNullAndEmptyArrays: true, // Keep playlists with no videos intact
  //     //   },
  //     // },
  //     // {
  //     //   $lookup: {
  //     //     from: 'videos', // The collection to join with
  //     //     localField: 'videos', // The field in Playlist that holds the video IDs
  //     //     foreignField: '_id', // The field in Video collection to match with
  //     //     as: 'videosData', // The resulting array will be placed in 'videosData'
  //     //   },
  //     // },

  //     // {
  //     //   $unwind: {
  //     //     path: '$videosData', // Unwind the 'videosData' array to get full video data
  //     //     preserveNullAndEmptyArrays: true, // Keep playlists with no videos intact
  //     //   },
  //     // },
  //     // // // Group the results back by playlist ID, and push the video data into a single array
  //     // {
  //     //   $group: {
  //     //     _id: '$_id',
  //     //     name: { $first: '$name' },
  //     //     description: { $first: '$description' },
  //     //     videosData: { $push: '$videosData' }, // Push all video data into an array
  //     //   },
  //     // },
  //   ]);

  const playListVideos = await Playlist.aggregate([
    [
      {
        $match: {
          $expr: {
            $eq: ['$_id', { $toObjectId: playlistId }],
          },
        },
      },
      {
        $lookup: {
          from: 'videos',
          localField: 'videos',
          foreignField: '_id',
          as: 'videos',
          pipeline: [
            {
              $lookup: {
                from: 'users',
                localField: 'owner',
                foreignField: '_id',
                as: 'owner',
                // pipeline: [
                //   {
                //     $project: {
                //       username: 1,
                //       avatar: 1,
                //       email: 1,
                //     },
                //   },
                // ],
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'owner',
          foreignField: '_id',
          as: 'owner',
          pipeline: [
            {
              $project: {
                username: '$username',
                email: '$email',
              },
            },
          ],
        },
      },
      {
        $addFields: {
          owner: {
            $first: '$owner',
          },
        },
      },
    ],
  ]);
  console.log('playlist', playListVideos);
  return res.status(200).json(new ApiResponse(200, playListVideos, 'Playlist videos sucessfully fetched'));
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoID } = req.params;

  const playlist = await Playlist.findById(playlistId);

  if (playlist.videos.includes(videoID)) {
    throw new ApiError(400, 'Video Already Exist in Playlist...');
  }
  playlist.videos.push(videoID);
  playlist.save();

  res.status(200).json(new ApiResponse(200, playlist, 'Video added succesfully'));
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoID } = req.params;
  console.log('playlistId', playlistId, videoID);
  // TODO: remove video from playlist

  const removeVidepFromPlaylist = await Playlist.updateOne(
    {
      _id: new mongoose.Types.ObjectId(playlistId),
      videos: new mongoose.Types.ObjectId(videoID),
    },
    {
      $pull: { videos: new mongoose.Types.ObjectId(videoID) }, // Remove the videoId from the 'videos' array
    }
  );
  if (result.nModified === 0) {
    return res.status(404).json({ message: 'Video not found in the playlist or invalid playlist ID' });
  }

  return res.status(200).json({ message: 'Video removed from playlist successfully!' });
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  // TODO: delete playlist

  if (!playlistId) {
    new ApiError(401, 'playlistid is not available');
  }
  const deletedPlaylist = await Playlist.deleteOne(playlistId);
  return res.status(200).json(new ApiResponse(200, deletedPlaylist, 'playlist deleted'));
});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;
  console.log('playlistId', playlistId, name, description);
  //TODO: update playlist

  if (
    [name, description].some((elem) => {
      elem === '';
    })
  ) {
    throw new ApiError(400, 'Field Should not Empty');
  }

  const updatedPlaylist = await Playlist.findByIdAndUpdate(playlistId, { $set: { name, description } }, { new: true });
  console.log('updatedPlaylist::=', updatedPlaylist);
  return res.status(200).json(new ApiResponse(200, updatedPlaylist, 'Playlist is updated '));
});

export { createPlaylist, getUserPlaylists, getPlaylistById, addVideoToPlaylist, removeVideoFromPlaylist, deletePlaylist, updatePlaylist };
