import { Router } from "express";
import { verifyJwt } from "../middlewares/AuthMiddleware.mid.js";
import {
  getFullListOfVideos,
  getSpecificvideo,
  publishVideo,
  deleteVideo,
  updateVideo
} from "../controllers/video.controller.js";
import { upload } from "../middlewares/MulterStorage.middelware.js";

const router = Router();

router.route("/get-video-list").get(verifyJwt, getFullListOfVideos);
router.route("/publish-video").post(
  verifyJwt,
  upload.fields([
    { name: "video", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 }
  ]),
  publishVideo
);

router
  .route("/singlevideo/:id")
  .get(getSpecificvideo)
  .patch(updateVideo)
  .delete(deleteVideo);

export default router;
