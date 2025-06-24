const mongoose = require('mongoose');
const {Schema} = mongoose;

const userSchema = new Schema({
    email:{
        type: String,
        require: true,
        unique: true
    },
    username:{
        type: String,
        default: null
    },
    password:{
        type: String,
        require: true
    },
    fullname:{
        type: String,
    },
    dob:{
        type: Date
    },
    isVerified:{
        type: Boolean,
        default: false
    },
    createdAt:{
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('User', userSchema);