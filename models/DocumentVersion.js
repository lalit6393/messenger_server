const mongoose = require('mongoose');
const { Schema } = mongoose;

const documentVersionSchema = new Schema({
    document:{
        type: Schema.Types.ObjectId,
        ref:'Document',
        require: true
    },
    content:{
        type: String,
        require: true
    },
    createdBy:{
        type: Schema.Types.ObjectId,
        ref:'User',
        require:true
    }
},{timestamps:true});

module.exports = mongoose.model('DocumentVersion', documentVersionSchema);