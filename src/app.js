import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
// import { ApiError } from './utils/ApiError.js';
const app = express();
// import { User } from './models/user.model.js';
import userRouter from './routes/user.routes.js';
import videoRouter from './routes/video.routes.js';

app.use(
  cors({
    origin: process.env.CORS_ORIGIN, //which sites or frontend or website are you allowing to request to backend.
    credentials: true,
  })
);

// async function createInitialUser() {
//   const existingUser = await User.findOne({ email: 'abc@gmail.com' });
//   if (!existingUser) {
//     // const hashedPassword = await bcrypt.hash("djashdjk", 10); // Hash the password
//     const user = await User.create({
//       username: 'abcd',
//       email: 'abc@gmail.com',
//       password: 'ajdakld',
//     });
//     console.log('Initial user created:', user);
//   }
// }

// Create the initial user if needed
// createInitialUser();
// User.create({ username: "abcd", email: "abc@gmail.com", password: "djashdjk" });

app.use(express.json({ limit: '16kb' })); //how much json we will accept..this is limitation for json
app.use(express.urlencoded({ extended: true, limit: '16kb' })); //when http request comes then some time data is in string form in request so we need to convert it into object to access the data thats why urlencoded is used
app.use(express.static('public')); //when we get pdf or any file like image it will store in public folder.
app.use(cookieParser());

//routing process

// app.listen(8000, () => {
//   console.log('app is listening on 8000');
// });
console.log('hello');

app.use('/app/v1', userRouter);
app.use('/app/v1', videoRouter);

export { app };
