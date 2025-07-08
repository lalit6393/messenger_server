const express = require('express');
const morgan = require('morgan');
const userRouter = require('./authenication/userauth');
const documentRouter = require('./routes/documents');

const app = express();

app.use(morgan('dev'));
app.use(express.json());

app.use('/', userRouter);
app.use('/', documentRouter)

module.exports = app;
