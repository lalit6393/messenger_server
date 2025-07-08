const Document = require("../models/Document");
const User = require("../models/User");
const DocumentVersion = require("../models/DocumentVersion");

exports.createDocument = async (req, res) => {
    const { userId, content, title, description } = req.body;

    let version;
    let document;

    try {
        version = await DocumentVersion.create({
            content,
            createdBy: userId
        });

        document = await Document.create({
            owner: userId,
            title,
            description,
            currentVersion: version._id
        });

        version.document = document._id;
        await version.save();

        res.status(201).json(document);
    }
    catch (err) {
        if (version && !document) {
            await DocumentVersion.findByIdAndDelete(version._id);
        } else if (version && document) {
            await DocumentVersion.findByIdAndDelete(version._id);
            await Document.findByIdAndDelete(document._id);
        }
        res.status(500).json({ status: 'failed', err: err?.message || 'Server Error' });
    }
}


exports.getAllDocument = async (req, res) => {
    const { userId } = req.body;

    try {
        const documents = await Document.find({
            $or: [
                { owner: userId },
                { 'collaborators.user': userId }
            ]
        }).populate('currentVersion');

        res.status(200).json({ status: 'success', data: documents });

    } catch (err) {
        res.status(500).json({ status: 'failed', err: err.message || 'Server Error' })
    }
}

exports.addCollaborator = async (req, res) => {
    const { userId, email, role, documentId } = req.body;

    try {
        const collaborator = await User.findOne({ email });

        if (!collaborator) {
            return res.status(404).json({ status: 'failed', err: 'User not found' });
        }

        const document = await Document.findById(documentId);
        if (!document) {
            return res.status(404).json({ status: 'failed', err: 'Document not found' });
        }

        if (String(document.owner) === String(collaborator._id)) {
            return res.status(400).json({ status: 'failed', err: 'Owner cannot be added as a collaborator' });
        }

        const alreadyAdded = document.collaborators.find((c) => String(c.user) === String(collaborator._id));

        if (alreadyAdded) {
            alreadyAdded.role = role || 'viewer';
        } else {
            document.collaborators.push({
                user: collaborator._id,
                role: role || 'viewer'
            });
        }
        await document.save();
        await document.populate('collaborators.user');


        res.status(200).json({ status: 'success', data: document });

    } catch (err) {
        res.status(500).json({ status: 'failed', err: err.message || 'Server Error' })
    }
}