const express = require('express');
const router = express.Router();
const { storeReturnTo } = require('../middleware');
const passport = require('passport');
const catchAsynch = require('../utils/catchAsynch');
const User = require('../models/user');

router.get('/register', (req,res) => {
    res.render('users/register');
});
router.post('/register', catchAsynch(async (req,res,next) =>{
    try{
        const { email, username, password } = req.body;
        const user = new User({ email, username });
        const registeredUser = await User.register( user,password );
        req.login(registeredUser, err =>{
            if (err) return next(err);
            req.flash('success','Welcome to Yelp Camp');
            res.redirect('/campgrounds');
        });
    } catch (e){
        req.flash('error', e.message);
        res.redirect('/register');
    }
}));

router.get('/login', (req,res) =>{
    res.render('users/login');
});

router.post('/login', storeReturnTo, passport.authenticate('local', {failureFlash:true, failureRedirect: '/login'}), (req,res) =>{
    req.flash('success', 'Welcome Back');
    const redirectUrl = res.locals.returnTo || '/campgrounds';
    delete req.session.returnTo;
    res.redirect(redirectUrl);
});

router.get('/logout', (req, res, next) => {
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        req.flash('success', 'Goodbye!');
        res.redirect('/campgrounds');
    });
}); 

module.exports = router;