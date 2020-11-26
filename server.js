const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const passport = require('passport');

const users = require('./routes/api/users');
const profile = require('./routes/api/profile');
const posts = require('./routes/api/posts');
const testss = require('./testss');

const app = express();

//Body Parser Middleware

app.use(bodyParser.urlencoded( {extended: false} ));
app.use(bodyParser.json());

app.get('/', (req, res) => {res.send("Hello World!")});

const db = require('./config/keys').mongoURI;

mongoose
    .connect(db)
    .then(() => console.log('Connected to database successfully!!'))
    .catch(() => console.log('Error in connection'));


app.use('/api/users', users);    
app.use('/api/profile', profile);    
app.use('/api/posts', posts);   
app.use('/testss', testss)

//Passport middleware

app.use(passport.initialize());

//Passport config

require('./config/passport')(passport);

const port = 5000;

app.listen(port, () => {console.log(`Connected on port ${port}`)});