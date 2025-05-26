import mongoose, { isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createPlaylist = asyncHandler(async (req, res) => {
  
  const { name, description } = req.body;

  
  if (!name || !description) {
    throw new ApiError(400, "Name and description are required");
  }

  
  const playlist = await Playlist.create({
    name,
    description,
    owner: req.user._id,
  });

  
  if (!playlist) {
    throw new ApiError(500, "Something went wrong while creating the playlist");
  }

  
  return res
    .status(201)
    .json(new ApiResponse(201, playlist, "Playlist created successfully"));

  
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  
  const { userId } = req.params;

  
  if (!isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid user ID");
  }

  
  const playlists = await Playlist.find({ owner: userId });

  
  if (!playlists || playlists.length === 0) {
    throw new ApiError(404, "Playlist not found");
  }

  
  return res
    .status(200)
    .json(
      new ApiResponse(200, playlists, "User playlists fetched successfully")
    );

  
});

const getPlaylistById = asyncHandler(async (req, res) => {
  // Extract playlistId from request parameters
  const { playlistId } = req.params;

  // Validate if playlistId is a valid MongoDB ObjectId
  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "Invalid playlist ID");
  }

  
  const playlist = await Playlist.findById(playlistId).populate("videos");

  // If no playlist is found, return a 404 error.
  if (!playlist) {
    throw new ApiError(404, "Playlist not found");
  }

  
  return res
    .status(200)
    .json(new ApiResponse(200, playlist, "Playlist fetched successfully"));

  
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  
  const { playlistId, videoId } = req.params;

  
  if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid playlist or video ID");
  }

  
  const updatedPlaylist = await Playlist.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(playlistId), // Find the playlist by ID
      },
    },
    {
      $addFields: {
        videos: {
          $setUnion: ["$videos", [new mongoose.Types.ObjectId(videoId)]], // Ensure unique videos
        },
      },
    },
    {
      $merge: {
        into: "playlists", // Update the existing playlist collection
      },
    },
  ]);

  // If no update was made, return an error.
  if (!updatedPlaylist) {
    throw new ApiError(404, "Playlist not found or video already added");
  }

  
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedPlaylist,
        "Video added to playlist successfully"
      )
    );


});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;

  
  if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid playlist or video ID");
  }

  
  const updatedPlaylist = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $pull: {
        videos: new mongoose.Types.ObjectId(videoId),
      },
    },
    {
      new: true,
    }
  );

  
  if (!updatedPlaylist) {
    throw new ApiError(404, "Playlist not found");
  }

  
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedPlaylist,
        "Video removed from playlist successfully"
      )
    );

  
});

const deletePlaylist = asyncHandler(async (req, res) => {
  
  const { playlistId } = req.params;

  
  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "Invalid playlist ID");
  }

  const deletedPlaylistDoc = await Playlist.findByIdAndDelete(playlistId);

  
  if (!deletedPlaylistDoc) {
    throw new ApiError(404, "Playlist not found");
  }

  
  return res
    .status(200)
    .json(
      new ApiResponse(200, deletedPlaylistDoc, "Playlist deleted successfully")
    );

  
});

const updatePlaylist = asyncHandler(async (req, res) => {
  
  const { playlistId } = req.params;
  const { name, description } = req.body;

  
  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "Invalid playlist ID");
  }

  
  if (!name || !description) {
    throw new ApiError(400, "Name or description cannot be empty");
  }

  
  const updatedPlaylistDoc = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $set: {
        name,
        description,
      },
    },
    {
      new: true,
    }
  );

  //  If the playlist is not found, return a 404 error.
  if (!updatedPlaylistDoc) {
    throw new ApiError(404, "Playlist not found");
  }

  
  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedPlaylistDoc, "Playlist updated successfully")
    );

  
});

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};