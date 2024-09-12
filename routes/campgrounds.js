const express = require('express');
const router = express.Router();
const { campgroundSchema } = require('../schema.js'); 
const { isLoggedIn } =require('../middleware.js');
const catchAsynch = require('../utils/catchAsynch');
const ExpressError = require('../utils/expressError');
const Campground = require('../models/campground');

const validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

router.get('/', catchAsynch(async(req,res) =>{
    const campgrounds = await Campground.find({});
    res.render("campgrounds/index", {campgrounds});
}));

router.get('/new', isLoggedIn, (req,res) => {
    res.render('campgrounds/new');
});

router.post('/', isLoggedIn, validateCampground, catchAsynch(async(req,res, next) =>{ 
    /* if (!req.body.campground) throw new ExpressError('Invalid Campground Data', 400); */
    const campground= new Campground(req.body.campground);
    await campground.save();
    req.flash('success', 'Successfully made a new campground');
    res.redirect(`/campgrounds/${campground._id}`)
}));

router.get('/:id', catchAsynch(async(req,res) =>{
    const campground = await Campground.findById(req.params.id).populate('reviews');
    if (!campground){
        req.flash('error', 'Cannot find that Campground');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', { campground, msg: req.flash('success')});
}));

router.get('/:id/edit', isLoggedIn, catchAsynch(async(req,res) =>{
    const campground = await Campground.findById(req.params.id)
    if (!campground){
        req.flash('error', 'Cannot find that Campground');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', {campground});
}));

router.put('/:id', isLoggedIn, catchAsynch(async(req,res) =>{
    const {id} = req.params;
    const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground})
    req.flash('success', 'Successfully Updated Campground');
    res.redirect(`/campgrounds/${campground._id}`)
}));

router.delete('/:id', isLoggedIn, catchAsynch(async(req,res) =>{
    const {id} = req.params
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted a campground');
    res.redirect('/campgrounds');
}));

module.exports = router;