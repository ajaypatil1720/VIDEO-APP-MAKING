import { Video } from '../models/video.model.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/AsyncHandler.js';
import { uploadFileWithCloudinary } from '../utils/Cloudinary.js';
import mongoose from 'mongoose';

//post a video

const publishVideo = asyncHandler(async (req, res) => {
  console.log('body is ::', req.body);
  const { title, description, content, duration } = req.body;
  console.log('req.body:=', req);

  if ([title, description, content].some((elem) => elem?.trim() === '')) {
    throw new ApiError(400, 'Field Should Not be empty');
  }
  //now upload video content

  let videoFilePath;
  if (req?.files && Array.isArray(req?.files?.video) && req?.files?.video?.length > 0) {
    videoFilePath = req?.files?.video[0]?.path;
  }
  const videoFileUrl = await uploadFileWithCloudinary(videoFilePath);
  if (!videoFileUrl) {
    throw new ApiError(400, 'Video File is required');
  }

  console.log('videoFileUrl:=', videoFileUrl);
  //upload thumbnail

  let thumbnailPath;
  if (req.files && Array.isArray(req.files.thumbnail)) {
    thumbnailPath = req.files.thumbnail[0].path;
  }

  const thumbnailUrl = await uploadFileWithCloudinary(thumbnailPath);

  const video = await Video.create({
    videoFile: videoFileUrl.url,
    duration: duration,
    content: content,
    thumbnail: thumbnailUrl.url,
    title: title,
    description: description,
  });
  console.log('video', video);

  return res.status(200).json(new ApiResponse(200, video, 'Video uploaded successfully'));
});
//get full list of video
const getFullListOfVideos = asyncHandler(async (req, res) => {
  //we have to paginate this video because we cant show like all videos  at one time
  const videosList = await Video.find({});
  console.log(videosList);

  return res.status(200).json(new ApiResponse(200, videosList, 'User List fetched Succesfully'));
});

//get specific video
const getSpecificvideo = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const video = await Video.findOne({ _id: id }); //we can use findById
  return res.status(200).json(new ApiResponse(200, video, 'video fetched succesfully'));
});

//update video controller

const updateVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  console.log(req.body);
  const { id } = req.params;

  if ([title, description].some((elem) => elem === '')) {
    throw new ApiError(400, 'Field Should not empty');
  }

  // Validate if the provided id is a valid MongoDB ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, 'Invalid video ID');
  }

  const updateVideoFile = await Video.findByIdAndUpdate(
    id,
    {
      $set: {
        title,
        description,
      },
    },
    { new: true }
  );

  console.log('updateVideoFile', updateVideoFile);
  return res.status(200).json(new ApiResponse(200, updateVideoFile, 'file updated succesfully'));
});

//delete Video controller

const deleteVideo = asyncHandler(async (req, res) => {
  const { id } = req.params;
  // Check if the provided id is a valid MongoDB ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, 'Invalid video ID');
  }

  const deleteVideo = await Video.findByIdAndDelete(id);

  // If no document was found to delete, return a not found error
  if (!deleteVideo) {
    throw new ApiError(404, 'Video not found');
  }

  // Respond with success
  return res.status(200).json(new ApiResponse(200, null, 'Video deleted successfully'));
});
export { getFullListOfVideos, publishVideo, getSpecificvideo, updateVideo, deleteVideo };
