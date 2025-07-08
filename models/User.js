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
        default: null,
        unique: true
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
    }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);