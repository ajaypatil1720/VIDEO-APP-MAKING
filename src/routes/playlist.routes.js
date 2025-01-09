import { Router } from "express";
import { verifyJwt } from "../middlewares/AuthMiddleware.mid.js";
import { createNewPlaylist } from "../controllers/playlist.controller.js";

const router = Router();

router.route("/createPlaylist/videoId").post(verifyJwt, createNewPlaylist);
export default router;
