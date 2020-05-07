const express = require('express');
const logger = require('morgan');
const mongoose = require('mongoose');
const compression = require('compression');

const PORT = 3000;

const app = express();

app.use(logger('dev'));

app.use(compression());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static('public'));

mongoose.connect(
	// 'mongodb://localhost/budget',
	'mongodb://userA1:passwordA1@ds231229.mlab.com:31229/heroku_c25mf537',
	{
		useNewUrlParser: true,
		useFindAndModify: false,
	}
);

const MONGOD_URI = process.env.MONGOD_URI || 'mongodb://localhost/budget';
mongoose.connect(MONGOD_URI);

// routes
app.use(require('./routes/api.js'));

app.listen(PORT, () => {
	console.log(`App running on port ${PORT}!`);
});
