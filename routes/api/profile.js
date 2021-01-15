const express = require('express');
const passport = require('passport');
const User = require('../../models/User');
const Profile = require('../../models/Profile');

const router = express.Router();

// test
router.get('/test', (req, res) => res.json({msg: "Profile workssss!"}))

//route to get the profile
router.get('/', passport.authenticate('jwt', {session: false}), (req, res) => {
    let errors = {};
    console.log("reqguestttttttttttttt" , req.user.id)
    Profile.findOne({ user: req.user.id }).then(profile => {
        if(!profile){
            console.log('not found')
            errors.noprofile = "There is no profile for this user";
            return res.status(400).json(errors);
        } else {
            console.log('found')
           return res.json(profile);
        }
    }).catch(err => {
        console.log(err)
    })
})

// plain profile route to create or update a new profile

router.post('/', passport.authenticate('jwt', {session: false}), (req, res) => {
    let profileFields = {};
    profileFields.user = req.user.id;
    let errors = {};
    if(req.body.handle) profileFields.handle = req.body.handle;

    // split skills into an array
    if(typeof req.body.skills !== 'undefined'){
        profileFields.skills = req.body.skills.split(',');
    }

    Profile.findOne( {user: req.user.id}).then(profile => {
        //update profile
        if(profile){
            Profile.findOneAndUpdate({user: req.user.id}, {$set: profileFields}, {new: true}).then(profile => {
                res.json(profile);
            })
        } else { 
            // create
            
            // check if handle exists
            Profile.findOne({handle: profileFields.handle}).then(profile => {
                if(profile){
                    errors.handle = "That handle already exists";
                    res.status(404).json(errors);
                } else {
                    new Profile(profileFields).save().then(profile => {
                        console.log('profile created')
                        console.log(profile)
                        res.json(profile);

                    })
                }
            }).catch(err=>{
                res.json(err);
            });
        } 
    })
});

//Route to delete a profile and user
router.delete('/', passport.authenticate('jwt', {session: false}), (req, res) => {
    Profile.findOneAndRemove({user: req.user.id})
        .then( res => {
            console.log("deletec p");
        }).catch(err=>{res.json({Failure: "Unable to delete"})});

    User.findOneAndRemove({ _id: req.user.id})
        .then( res=> {
            console.log("deletec u");
            res.json({ success: "Deleted Successfully"})
            }
        ).catch(err=> {
            res.json(err);
        });    
});

//add-experience route -> PRIVATE

router.post('/add-experience', passport.authenticate('jwt', {session: false}), (req, res) => {

    const errors = {}   
    console.log('on server')
    Profile.findOne({ user: req.user.id})
    .then(profile => {
        const newExp = {
            company: req.body.company,
            from: req.body.from,
            to: req.body.to
        }
        
        // Add to the experiance array
        profile.experience.unshift(newExp);    

        profile.save().then(profile => res.json(profile))
    })
});

module.exports = router;