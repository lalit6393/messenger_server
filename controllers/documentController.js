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
        }).populate('collaborators.user');

        res.status(200).json({ status: 'success', data: documents });

    } catch (err) {
        res.status(500).json({ status: 'failed', err: err.message || 'Server Error' })
    }
}

exports.addCollaborator = async (req, res) => {
    const { email, role, documentId } = req.body;

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

exports.getAllVersionDocuments = async (req, res) => {

    const { documentId } = req.params;
    const page = parseInt(req.query.page) || 0;
    const skip = page * 5;


    try {
        const documents = await DocumentVersion.find({ document: documentId }).sort({ createdAt: -1 }).skip(skip).limit(5);

        res.status(200).json({ status: 'success', data: documents });

    } catch (err) {
        res.status(500).json({ status: 'failed', err: err.message || 'Server Error' })
    }
}

exports.updateDocument = async (req, res) => {
    const { userId, content } = req.body;
    const { documentId } = req.params;

    try {
        const document = await Document.findById(documentId);

        if (!document) return res.status(404).json({ status: 'failed', err: 'Document not found.' });

        if (String(document.owner) !== userId) {
            const collaborator = document.collaborators.find((c) => String(c.user) === userId);

            if (!collaborator || collaborator.role === 'viewer') return res.status(401).json({ status: 'failed', err: 'No edit access' });
        }

        const documentVersion = await DocumentVersion.create(
            {
                document: documentId,
                content: content,
                createdBy: userId
            }
        );

        document.currentVersion = documentVersion._id;

        await document.save();
        await document.populate('currentVersion');

        res.status(200).json({ status: 'success', data: document });

    } catch (err) {
        res.status(500).json({ status: 'failed', err: err.message || 'Server Error' })
    }
}

exports.getCurrentDocumentVersion = async (req, res) => {

    const { userId } = req.body;
    const { documentId } = req.params;


    try {
        const document = await Document.findById(documentId);

        if (!document) return res.status(404).json({ status: 'failed', err: 'Document not found.' });

        if (String(document.owner) !== userId) {
            const collaborator = document.collaborators.find((c) => String(c.user) === userId);

            if (!collaborator) return res.status(401).json({ status: 'failed', err: 'No access to this document.' });
        }

        await document.populate([
            { path: 'currentVersion' },
            { path: 'collaborators.user' }
        ]);

        res.status(200).json({ status: 'success', data: document });

    } catch (err) {
        res.status(500).json({ status: 'failed', err: err.message || 'Server Error' })
    }
}

exports.getSpecificVersionOfDocument = async (req, res) => {

    const { userId } = req.body;
    const { version } = req.params;

    try {
        const versionDoc = await DocumentVersion.findById(version);
        if (!versionDoc) return res.status(404).json({ status: 'failed', err: 'Document Version not found.' });

        const document = await Document.findById(versionDoc.document).lean();;
        if (!document) return res.status(404).json({ status: 'failed', err: 'Document not found.' });

        if (String(document.owner) !== userId) {
            const collaborator = document.collaborators.find((c) => String(c.user) === userId);

            if (!collaborator) return res.status(401).json({ status: 'failed', err: 'No access to this document.' });
        }

        await versionDoc.populate('createdBy');

        document.specificVersion = versionDoc;

        res.status(200).json({ status: 'success', data: document });

    } catch (err) {
        res.status(500).json({ status: 'failed', err: err.message || 'Server Error' })
    }
}

exports.restoreToVersion = async (req, res) => {
    const { userId } = req.body;
    const { documentId, versionId } = req.params;

    try{
        if(!documentId || !versionId) return res.status(404).json({ status: 'failed', err: 'Document or Version id not found.' });

        const versionDoc = await DocumentVersion.findById(versionId);
        if(!versionDoc) return res.status(404).json({ status: 'failed', err: 'Document Version not found.' });

        const document = await Document.findById(documentId);

        if (String(document.owner) !== userId) {
            const collaborator = document.collaborators.find((c) => String(c.user) === userId);

            if (!collaborator) return res.status(401).json({ status: 'failed', err: 'No access to this document.' });
            else if(collaborator.role !== 'editor') return res.status(401).json({ status: 'failed', err: 'No edit access to this document.' });
        }

        document.currentVersion = versionDoc._id;

        await document.save();
        
        res.status(200).json({status:'success', data : {message: 'Version Restored'}});

    }catch(err){
        res.status(500).json({ status: 'failed', err: err.message || 'Server Error' });
    }
}