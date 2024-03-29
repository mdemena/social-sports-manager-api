require('dotenv').config();

const cookieParser = require('cookie-parser');
const express = require('express');
const formData = require("express-form-data");
const favicon = require('serve-favicon');
const logger = require('morgan');
const path = require('path');
const cors = require('cors');
const passport = require('passport');

const app = express();

require('./configs/db.config');
require('./configs/passport.config');
require('./configs/session.config')(app);
require('./configs/newrelic.config');

const app_name = require('./package.json').name;
const debug = require('debug')(
	`${app_name}:${path.basename(__filename).split('.')[0]}`
);

// Middleware Setup
app.use(
	cors({
		credentials: true,
		origin: [
			'http://localhost',
			'http://localhost:3000',
		],
	})
);
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(formData.parse());
app.use(cookieParser());

// Express View engine setup

app.use(
	require('node-sass-middleware')({
		src: path.join(__dirname, 'public'),
		dest: path.join(__dirname, 'public'),
		sourceMap: true,
	})
);

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.use(express.static(path.join(__dirname, 'build')));
app.use(favicon(path.join(__dirname, 'build', 'favicon.ico')));

app.use(passport.initialize());
app.use(passport.session());

// default value for title local
app.locals.title = 'API - Assistants Manager !!';

const index = require('./routes/index.routes');
app.use('/', index);

const indexAPI = require('./routes/index.routes');
app.use('/api', indexAPI);

const authRoute = require('./routes/auth.routes');
app.use('/api/auth', authRoute);

const userRoute = require('./routes/user.routes');
app.use('/api/users', userRoute);

const clubRoute = require('./routes/club.routes');
app.use('/api/clubs', clubRoute);

const seasonRoute = require('./routes/season.routes');
app.use('/api/seasons', seasonRoute);

const categoryRoute = require('./routes/category.routes');
app.use('/api/categories', categoryRoute);

const teamRoute = require('./routes/team.routes');
app.use('/api/teams', teamRoute);

const gameRoute = require('./routes/game.routes');
app.use('/api/games', gameRoute);

const assistantRoute = require('./routes/assistant.routes');
app.use('/api/assistants', assistantRoute);

const comunicationRoute = require('./routes/comunication.routes');
app.use('/api/comunications', comunicationRoute);

app.use((req, res, next) => {
	res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// catch 404 and forward to error handler
app.use((req, res, next) => {
	const err = new Error('Not Found');
	err.status = 404;
	next(err);
});

// error handler
app.use((err, req, res, next) => {
	// set locals, only providing error in development
	console.log(err);
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};

	// render the error page
	res.status(err.status || 500);
	res.send('ERROR EN APP');
});

module.exports = app;
