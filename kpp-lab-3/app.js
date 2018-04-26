const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const mongoose = require('mongoose');
const routes = require('./routes');
const MongoStore = require('connect-mongo')(session);



// Initiating Express app
const app = express();

// Setting up PORT
const PORT = process.env.PORT || 3000;

// Set up default Mongoose connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/pomdos';
mongoose.connect(MONGODB_URI)
// Get Mongoose to use the global promise library
mongoose.Promise = global.Promise;
// Get the default connection
const db = mongoose.connection
// Bind connection to error event (to get notification of connection errors)
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// Use Sessions for tracking logins
app.use(session({
    secret: 'PomDO project',
    resave: true,
    saveUninitialized: false,
    store: new MongoStore({
        mongooseConnection: db
    })
}));

// Make user ID available in templates
app.use((req, res, next) => {
    res.locals.currentUser = req.session.userId;
    next();
});

// parse incoming requests
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// serve static files from /public
app.use(express.static(__dirname + '/public'));

// view engine setup
app.set('view engine', 'pug');
app.set('views', __dirname + '/views');

// Routes will be handled by mainRoute
app.use('/', routes);


// Creating an error handler
app.use( (err, req, res, next) => { // If an error has been passed from a middleware this error handler will catch it (see how it has 4 params?)
    res.locals.err = err;
    res.render('error');
})

app.listen(PORT, () => console.log(`App Running on PORT ${PORT}`));