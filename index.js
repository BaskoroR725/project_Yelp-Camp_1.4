const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const ExpressError = require('./utils/expressError');
const methodOverride = require('method-override');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user.js');

const userRoutes = require('./routes/user.js');
const campgroundRoutes = require('./routes/campgrounds.js');
const reviewRoutes = require('./routes/reviews.js');

mongoose.connect('mongodb://localhost:27017/yelp-camp');

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () =>{
    console.log("Database Connected")
})

app.engine('ejs', ejsMate);
app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));
const sessionConfig = {
    secret:'thisissecret',
    resave:false,
    saveUninitialized:true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 *24 * 7,
        maxAge: 1000 * 60 * 60 *24 * 7
    }
}
app.use(session(sessionConfig));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

app.set("views", path.join(__dirname, 'views'))
app.set('view engine', 'ejs');


/* const validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
} */


app.use('/', userRoutes);
app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/reviews', reviewRoutes)

app.get('/', (req,res) =>{
    res.render("home");
});


app.all('*', (req,res,next) =>{
    next(new ExpressError('Page Not Found', 404));
});

app.use((err,req,res,next) =>{
    const{ statusCode = 500} = err;
    if (!err.message) err.message = "Oh no, Something went wrong"
    res.status(statusCode).render('error', {err})});

app.listen(3000, () =>{
    console.log('Listening on port 3000');
});