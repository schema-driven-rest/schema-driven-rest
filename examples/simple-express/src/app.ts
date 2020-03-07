
import express from 'express';
import {router as indexRouter} from './routes';
import {router as usersRouter} from './routes/users';

export const app = express();

// view engine setup
app.use(express.json());
app.use(express.urlencoded({extended: false}));

app.use('/', indexRouter);
app.use('/users', usersRouter);


