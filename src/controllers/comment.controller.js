import { asyncHandler } from '../utils/AsyncHandler.js';
import { Comment } from '../models/playlist.model.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import mongoose from 'mongoose';

// const getVideoComments = asyncHandler(async (req, res) => {
//   //TODO: get all comments for a video
//   const { videoId } = req.params;
//   const { page = 1, limit = 10 } = req.query;
// });

const getTweetComments = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  let { limit, page } = req.query;
  let skip;
  ({ limit, page, skip } = handlePaginationParams(limit, page));
  if (!tweetId || !isValidObjectId(tweetId)) {
    throw apiError(400, 'videoId is required');
  }
  const comments = await Comment.aggregate([
    {
      $match: {
        $expr: {
          $eq: ['$tweet', { $toObjectId: tweetId }],
        },
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
              avatar: 1,
              username: 1,
            },
          },
        ],
      },
    },
    {
      $project: {
        content: 1,
        owner: 1,
        tweet: 1,
      },
    },
    {
      $unwind: {
        path: '$owner',
      },
    },
    {
      $lookup: {
        from: 'likes',
        localField: '_id',
        foreignField: 'comment',
        as: 'commentLikes',
      },
    },
    {
      $addFields: {
        commentLikes: {
          $size: '$commentLikes',
        },
      },
    },
    {
      $skip: skip,
    },
    {
      $limit: limit,
    },
    {
      $sort: {
        createdAt: -1,
      },
    },
  ]);
  if (comments.length === 0) {
    return res.status(200).json(new apiResponse(200, comments, 'There are no comments on this tweet'));
  }

  return res.status(200).json(new apiResponse(200, comments, 'Successfully fetched tweet comments'));
});

const getVideoComments = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  let { limit, page } = req.query;
  let skip;
  ({ limit, page, skip } = handlePaginationParams(limit, page));
  if (!videoId || !isValidObjectId(videoId)) {
    throw apiError(400, 'videoId is required');
  }
  const comments = await Comment.aggregate([
    {
      $match: {
        $expr: {
          $eq: ['$video', { $toObjectId: videoId }],
        },
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
              avatar: 1,
              username: 1,
            },
          },
        ],
      },
    },
    {
      $project: {
        content: 1,
        owner: 1,
        video: 1,
      },
    },
    {
      $unwind: {
        path: '$owner',
      },
    },
    {
      $lookup: {
        from: 'likes',
        localField: '_id',
        foreignField: 'comment',
        as: 'commentLikes',
      },
    },
    {
      $addFields: {
        commentLikes: {
          $size: '$commentLikes',
        },
      },
    },
    {
      $skip: skip,
    },
    {
      $limit: limit,
    },
    {
      $sort: {
        createdAt: -1,
      },
    },
  ]);
  if (comments.length === 0) {
    return res.status(200).json(new apiResponse(200, comments, 'There are no comments on this video'));
  }

  return res.status(200).json(new apiResponse(200, comments, 'Successfully fetched video comments'));
});

const addComment = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const userId = req.user._id;
  const { content } = req.body;
  if (!content) {
    throw new ApiError(400, 'content is required');
  }
  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, 'Video not found');
  }
  if (!isValidObjectId(videoId)) {
    throw new ApiError('Invalid video id');
  }
  const createdComment = await Comment.create({
    content,
    video: videoId,
    owner: userId,
  });
  if (!createdComment) {
    throw new ApiError(500, 'Failed to add comment');
  }
  const aggregatedComment = await Comment.aggregate([
    {
      $match: {
        $expr: {
          $eq: ['$_id', { $toObjectId: createdComment._id }],
        },
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
              username: 1,
              avatar: 1,
            },
          },
        ],
      },
    },
    {
      $unwind: {
        path: '$owner',
      },
    },
    {
      $lookup: {
        from: 'likes',
        localField: '_id',
        foreignField: 'comment',
        as: 'videoLikes',
      },
    },
    {
      $addFields: {
        videoLikes: {
          $size: '$videoLikes',
        },
      },
    },
  ]);
  if (!aggregatedComment) {
    throw new ApiError(500, 'Failed to aggregate comment');
  }
  return res.status(201).json(new ApiResponse(201, aggregatedComment, 'Comment added successfully'));
});

const updateComment = asyncHandler(async (req, res) => {
  const { newContent } = req.body;
  if (!newContent) {
    throw apiError(400, 'newContent is required');
  }
  const commentId = req.params.commentId;
  if (!commentId || !isValidObjectId(commentId)) {
    throw apiError(400, 'Invalid commentId');
  }
  const existingComment = await Comment.findById(commentId);
  if (!existingComment) {
    throw new apiError(400, 'No comment found with the provided id');
  }
  const updatedComment = await Comment.findByIdAndUpdate(
    commentId,
    {
      content: newContent,
    },
    {
      new: true,
    }
  );

  if (!updatedComment) {
    throw new apiError(404, 'Comment not found or could not be updated');
  }

  const aggregatedComment = await Comment.aggregate([
    {
      $match: {
        $expr: {
          $eq: ['$_id', { $toObjectId: updatedComment._id }],
        },
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
              username: 1,
              avatar: 1,
            },
          },
        ],
      },
    },
    {
      $unwind: {
        path: '$owner',
      },
    },
    {
      $lookup: {
        from: 'likes',
        localField: '_id',
        foreignField: 'comment',
        as: 'comments',
      },
    },
    {
      $addFields: {
        comments: {
          $size: '$comments',
        },
      },
    },
  ]);

  if (!aggregatedComment) {
    throw new apiError(500, 'There was a problem while aggregating the comment');
  }
  return res.status(200).json(new apiResponse(200, aggregatedComment, 'Successfully updated comment'));
});

const deleteComment = asyncHandler(async (req, res) => {
  const commentId = req.params.commentId;
  const deletedComment = await Comment.findByIdAndDelete(commentId);
  if (!deletedComment) {
    throw new apiError(400, 'There was a problem while deleting comment');
  }
  return res.status(200).json(new apiResponse(200, null, 'Successfully deleted comment'));
});

//question here why?
const deleteTweetComment = asyncHandler(async (req, res) => {
  const commentId = req.params.commentId;
  const deletedTweetComment = await Tweet.findByIdAndDelete(commentId);
  if (!deletedTweetComment) {
    throw new apiError(400, 'There was a problem while deleting tweet comment');
  }
  return res.status(200).json(new apiResponse(200, null, 'Successfully deleted tweet comment'));
});

const updateTweetComment = asyncHandler(async (req, res) => {
  const { newContent } = req.body;
  if (!newContent) {
    throw apiError(400, 'newContent is required');
  }
  const commentId = req.params.commentId;
  if (!commentId || !isValidObjectId(commentId)) {
    throw apiError(400, 'Invalid commentId');
  }
  const existingTweetComment = await Tweet.findById(commentId);
  if (!existingTweetComment) {
    throw new apiError(400, 'No comment found with the provided id');
  }
  const updatedTweetComment = await Tweet.findByIdAndUpdate(
    commentId,
    {
      content: newContent,
    },
    {
      new: true,
    }
  );

  if (!updatedTweetComment) {
    throw new apiError(404, 'Comment not found or could not be updated');
  }

  const aggregatedTweetComment = await Tweet.aggregate([
    {
      $match: {
        $expr: {
          $eq: ['$_id', { $toObjectId: updatedTweetComment._id }],
        },
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
              username: 1,
              avatar: 1,
            },
          },
        ],
      },
    },
    {
      $unwind: {
        path: '$owner',
      },
    },
    {
      $lookup: {
        from: 'likes',
        localField: '_id',
        foreignField: 'tweet',
        as: 'tweetLikes',
      },
    },
    {
      $addFields: {
        tweetLikes: {
          $size: '$tweetLikes',
        },
      },
    },
  ]);

  if (!updatedTweetComment) {
    throw new apiError(500, 'There was a problem while aggregating the tweet');
  }
  return res.status(200).json(new apiResponse(200, updatedTweetComment, 'Successfully updated tweet'));
});

export { getVideoComments, addComment, updateComment, deleteComment, deleteTweetComment };
