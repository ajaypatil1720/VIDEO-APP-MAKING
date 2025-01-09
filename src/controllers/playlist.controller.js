import { asyncHandler } from "../utils/AsyncHandler.js";
import { Playlist } from "../models/playlist.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const createNewPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  const { videoId } = req.params;

  let playlist = await Playlist.create({
    name,
    description,
    video: [videoId]
  });

  if (!playlist) {
    throw new ApiError(400, "playlist is not created");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, playlist, "Playlist created succesfully"));
});

export { createNewPlaylist };
