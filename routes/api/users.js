const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');

const validateRegisterInput = require('../../validation/register');
const validateLoginInput = require('../../validation/login');


const User = require('../../models/User');

router.get('/test', (req, res)=> {res.send("successs")  })//res.json({ msg: "users works!" })


router.post('/register', (req, res) => {
    const { errors, isValid } = validateRegisterInput(req.body);
    if(!isValid) {
        return res.status(400).json(errors);
    }

    User.findOne({ email: req.body.email })
        .then(user => {
            if(user){
                return res.status(400).json({email: 'Email already exists'});
            } else {
                const avatar = gravatar.url(req.body.email, {
                    s: '200',
                    r: 'pg',
                    d: 'mm'
                }); //image comes from the email ID

                //creating the new user
                const newUser = new User({
                    name: req.body.name,
                    email: req.body.email,
                    avatar,
                    password: req.body.password
                });
            //encryption of password
            bcrypt.genSalt(10, (err, salt)=> {
                bcrypt.hash(newUser.password, salt, (err, hash) => {
                    if(err) throw err;
                    newUser.password = hash;
                    newUser.save()
                    .then(user => {
                        res.json(user);
                    })
                    .catch(err => {
                        console.log(err);
                    })
                });
            })
        }
    })//.catch(err => {console.log(err)})
})

router.post('/login', (req, res) => {

    const { errors, isValid } = validateLoginInput(req.body);

    if(!isValid){
        res.status(400).json(errors);
    }

    const email = req.body.email;
    const password = req.body.password;

    //check for email

    User.findOne({email})
    .then( (user) => {
        if(!user) {
            errors.email = 'User not Found! :(';
            return res.status(404).json(errors);
        }

        //check password
        bcrypt.compare(password, user.password) // THIS IS TO COMPARE THE HASHED PASSWORD WITH THE USER-ENTERED PASSWORD
            .then(isMatched => {
                if(isMatched){
                    // sign the token
                    const payload = {
                        id: user.id,
                        name: user.name,
                        avatar: user.avatar
                    }

                    jwt.sign(payload, process.env.SECRET_OR_KEY, { expiresIn: 3600}, (err, token)=> {
                        res.json({
                            success: true,
                            token: 'Bearer ' + token
                        })
                    })
                }else{
                    errors.password = 'Password Incorrect :(';
                    res.status(400).json(errors);
                }
            })
    })
});

// @route GET api/users/current
// @desc Return current user
// @access Private
router.get('/current', passport.authenticate('jwt', {session: false}), (req, res) => {
    res.json(req.user);
});

module.exports = router;