import mongoose, { Schema } from 'mongoose';
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const UserSchema = mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    avatar: {
      type: String, //cloudianary url
      //   required: true,
    },
    coverimage: {
      type: String,
      //   require: true,
    },
    watchHistory: {
      type: Schema.Types.ObjectId,
      ref: 'Video',
    },
    password: {
      type: String,
      required: [true, 'password is must'],
    },
    refreshToken: {
      type: String,
    },
  },
  { timestamps: true }
);

//1.use normal function to access the property of userschema using this keyword.
//2.beacuse its middleware so use next
//3.this is hook (pre) which is execute before save the code into db.
//bycrypt library is just hash our password using encryption
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10); //10 rounds to hash password
  next();
});

UserSchema.methods.isPasswordCorrect = async function (password) {
  if (password) {
    return await bcrypt.compare(password, this.password); //method also provide the access of this.password and due to computation of ecryption algo we will use async await
  }
};

//this plugin is used for aggregation pipeling
UserSchema.plugin(mongooseAggregatePaginate);

//jwt is used as a bearer token means if api need data then api should have token to access the data
UserSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};

UserSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};

const User = mongoose.model('User', UserSchema);
export { User };
