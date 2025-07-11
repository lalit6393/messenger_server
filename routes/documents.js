const express = require('express');
const { createDocument, getAllDocument, addCollaborator, getAllVersionDocuments, updateDocument, getCurrentDocumentVersion } = require('../controllers/documentController');
const { verifyToken } = require('../middleware/auth');


const router = express.Router();

router.post('/document',verifyToken, createDocument);

router.get('/documents', verifyToken, getAllDocument);

router.post('/document/collaborator', verifyToken, addCollaborator);

router.get('/document/:documentId', verifyToken, getAllVersionDocuments);

router.put('/document/:documentId', verifyToken, updateDocument);

router.get('/document/:documentId/version/latest', verifyToken, getCurrentDocumentVersion);

module.exports = router;