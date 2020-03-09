
import express from 'express';
import {setupRoutes} from './routes/setup';

export const app = express();

// view engine setup
app.use(express.json());
app.use(express.urlencoded({extended: false}));

app.use('/', indexRouter);
app.use('/users', usersRouter);


