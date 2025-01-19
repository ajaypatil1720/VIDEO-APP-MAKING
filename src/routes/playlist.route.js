import { Router } from 'express';
import { verifyJwt } from '../middlewares/AuthMiddleware.mid.js';
import { addVideoToPlaylist, createPlaylist, getPlaylistById, getUserPlaylists, removeVideoFromPlaylist, updatePlaylist } from '../controllers/playlist.controller.js';

const router = Router();

router.route('/createPlaylist').post(verifyJwt, createPlaylist);
router.route('/addVideoToPlaylist/:videoID/:playlistId').post(verifyJwt, addVideoToPlaylist);
router.route('/removeVideoFromPlaylist/:videoID/:playlistId').get(verifyJwt, removeVideoFromPlaylist);
router.route('/getUserPlaylists/:userId').get(verifyJwt, getUserPlaylists);
router.route('/getPlaylistById/:playlistId').get(verifyJwt, getPlaylistById);
router.route('/updatePlaylist/:playlistId').patch(verifyJwt, updatePlaylist);
export default router;
