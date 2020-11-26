const Validator = require('validator');
const isEmpty = require('./isEmpty');

module.exports = function validateLoginInput(data){
    let errors = {};

    data.email = !isEmpty(data.email)? data.email : '';
    data.password = !isEmpty(data.password)? data.password : '';

    if(!Validator.isEmail(data.email)){
        errors.email = 'Incorrect Email format';
    }

    if(Validator.isEmpty(data.email)){
        errors.email = 'Email field is required';
    }

    if(!Validator.isLength(data.password, { min: 6, max: 30 })){
        errors.password = 'Password must have between 6 and 30 characters';
    }

    if(Validator.isEmpty(data.password)){
        errors.password = 'Password field is required';
    }


    if(Validator)
    return {
        errors,
        isValid: isEmpty(errors)
    }
};