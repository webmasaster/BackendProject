import { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  // Get the userId of the currently authenticated user
  const userId = req.user._id;

  // Validate if videoId is a proper MongoDB ObjectId
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  
  const existingLike = await Like.findOne({
    video: videoId,
    likedBy: userId,
  });

  
  if (existingLike) {
    // Remove the existing like
    await Like.findByIdAndDelete(existingLike._id);
    return res
      .status(200)
      .json(new ApiResponse(200, existingLike, "Video unliked successfully"));
  }

  // If no like exists, create a new like
  const likeVideo = await Like.create({
    video: videoId,
    likedBy: userId,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, likeVideo, "Video liked successfully"));

  
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  
  const { commentId } = req.params;

  
  const userId = req.user._id;

  
  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, "Invalid comment ID");
  }

  
  const existingLike = await Like.findOne({
    comment: commentId,
    likedBy: userId,
  });

  if (existingLike) {
    // Remove the existing like
    await Like.findByIdAndDelete(existingLike._id);

    return res
      .status(200)
      .json(new ApiResponse(200, existingLike, "Comment unliked successfully"));
  }

  
  const likeComment = await Like.create({
    comment: commentId, // Linking the like to the specific comment
    likedBy: userId, // Storing which user liked this comment
  });

  return res
    .status(201)
    .json(new ApiResponse(201, likeComment, "Comment liked successfully"));
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  

  const { tweetId } = req.params;

  const userId = req.user._id;

  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, "Invalid tweet ID");
  }

  const existingLike = await Like.findOne({
    tweet: tweetId,
    likedBy: userId,
  });

  if (existingLike) {
    await Like.findByIdAndDelete(existingLike._id);

    return res
      .status(200)
      .json(new ApiResponse(200, existingLike, "Tweet unliked successfully"));
  }

  const likeTweet = await Like.create({
    tweet: tweetId,
    likedBy: userId,
  });
  return res
    .status(201)
    .json(new ApiResponse(201, likeTweet, "Tweet liked successfully"));
});

const getLikedVideos = asyncHandler(async (req, res) => {
  
  const userId = req.user._id;
  const likedVideos = await Like.find({
    likedBy: userId, 
    video: { $exists: true },
  }).populate("video", "_id title url"); // Populate the video details

  return res
    .status(200)
    .json(
      new ApiResponse(200, likedVideos, "Liked videos fetched successfully")
    );


});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };