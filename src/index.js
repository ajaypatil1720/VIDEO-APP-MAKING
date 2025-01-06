import { app } from './app.js';

import connectDB from './db/index.js';

import dotenv from 'dotenv';

dotenv.config({
  path: './env',
});

connectDB()
  .then(() => {
    app.listen(8000, () => {
      console.log('Server is running at 8000');
    });
  })
  .catch((err) => console.log('Mongo connection failed!!', err));

app.get('/users', async (req, res) => {
  res.send('Hello World134');
});

// app.use('/user', userRouter);
