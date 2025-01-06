//for register user
//validation:- not empty
//need:-
//check image or avatar
//firstname
//lastname
//username-check username or email is already exist or not
//password encrypted store but dont send in response
//return response
import { User } from '../models/user.model.js';

import { ApiError } from '../utils/ApiError.js';
import { uploadFileWithCloudinary } from '../utils/Cloudinary.js';
import { ApiResponse } from '../utils/ApiResponse.js';
// import Jwt from 'jsonwebtoken';

const generateAccessAndRefereshTokens = async (userId) => {
  const user = await User.findById(userId);
  const accessToken = user.generateAccessToken();
  console.log('accessToken is:- ', accessToken);

  const refreshToken = user.generateRefreshToken();
  console.log('accessToken && refreshToken is:- ', refreshToken);
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  return { accessToken, refreshToken };
};
const registerUser = async (req, res) => {
  //   console.log('request', req.body);

  const { fullName, email, username, password } = req.body;
  console.log('body is ::=', req.body);

  if ([fullName, username, password].some((elem) => elem?.trim() === '')) {
    throw new ApiError(400, 'Field Should Not be empty');
  }

  const existedUser = await User.findOne({
    $or: [{ username }, { email }], //[{username:"amit"},{email:'amit@gmail.com'}]
  });
  console.log('existedUser=', existedUser);

  if (existedUser) {
    throw new ApiError(409, 'User With this email already exist');
  }

  console.log('REQEATING FILE ', req.files);
  const avatarLocalPath = req.files?.avatar[0]?.path;
  console.log('Avatar file is :-', avatarLocalPath);
  //const coverImageLocalPath = req.files?.coverImage[0]?.path;

  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  if (!avatarLocalPath) {
    throw new ApiError(400, 'Avatar file is required');
  }

  const avatar = await uploadFileWithCloudinary(avatarLocalPath);
  console.log('Avatar is ', avatar);
  const coverImage = await uploadFileWithCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(400, 'Avatar file is required new');
  }

  const user = User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || '',
    email,
    password,
    username: username.toLowerCase(),
  });

  const createdUser = await User.findById(user._id).select(
    '-password -refreshToken'
  );

  console.log('Created USer is ', createdUser);

  if (!createdUser) {
    throw new ApiError(500, 'Something went wrong while registering the user');
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, 'User registered Successfully'));
};

const loginUser = async (req, res) => {
  // steps:-
  // req=>body
  //username or email
  //find the user
  //password check
  //access and refresh token
  //send cookie
  const { email, username, password } = req.body;

  if (!username && !password) {
    throw new ApiError(400, 'username or password is invalid');
  }

  const userData = User.findOne({
    $or: [{ username }, { password }],
  });

  if (!userData) {
    throw new ApiError(404, 'Invalid Credentials');
  }

  const isPasswordValid = await userData.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, 'Invalid user credentials');
  }

  const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(
    userData._id
  );

  const loggedInUser = await User.findById(userData._id).select(
    '-password -refreshToken'
  );

  const options = {
    httpOnly: true,
    secure: true,
  }; // this means this cookies is only modified by server not from frontend

  return res
    .status(200)
    .cookie('accessToken', accessToken, options)
    .cookie('refreshToken', refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        'User logged In Successfully'
      )
    );
};

//just remove refreshtoken and just clear the cookies.
const logoutUser = async (req, res) => {
  if (req?.user) {
    await User.findById(
      req?.user?._id,
      {
        $set: {
          refreshToken: undefined,
        },
      },
      { new: true }
    );
  }

  let options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .clearCookie('accessToken', options)
    .clearCookie('refreshToken', options)
    .json(new ApiResponse(200, {}, 'User LoggedOut'));
};

//now controller for refresh the token
const refreshAccessToken = async (req, res) => {};

export { registerUser, loginUser, logoutUser };
