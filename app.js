const express = require('express');
const morgan = require('morgan');
const userRouter = require('./authenication/userauth');

const app = express();

app.use(morgan('dev'));
app.use(express.json());

app.use('/', userRouter);

module.exports = app;
