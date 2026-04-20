const express = require('express');
const router = express.Router();
const { generateAIBundle,chatWithAI } = require('../controllers/aiController');

router.post('/generate', generateAIBundle);
router.post('/bundle-generator', generateAIBundle); // matching frontend call
router.post('/chat', chatWithAI);



module.exports = router;

