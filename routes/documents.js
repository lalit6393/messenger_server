const express = require('express');
const { createDocument, getAllDocument, addCollaborator } = require('../controllers/documentController');
const { verifyToken } = require('../middleware/auth');


const router = express.Router();

router.post('/document',verifyToken, createDocument);

router.get('/documents', verifyToken, getAllDocument);

router.post('/document/collaborator', verifyToken, addCollaborator);

module.exports = router;