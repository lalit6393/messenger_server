const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const documentSchema = new Schema({
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        require: true
    },
    title: {
        type: String,
        default: 'New Document'
    }, 
    description: {
        type: String,
        default: null
    },
    collaborators: [{
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        },
        role: {
            type: String,
            enum: ['owner', 'editor', 'viewer'],
            default: 'viewer'
        }
    }],
    currentVersion: {
        type: Schema.Types.ObjectId,
        ref: 'DocumentVersion'
    }
}, { timestamps: true });

module.exports = mongoose.model('Document', documentSchema);
