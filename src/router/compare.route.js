const { Router } = require('express');
const CompareController = require('../controller/compare.controller');
const middlewareCompare = require('../middlewares/compare.middleware');
const controller = new CompareController();
const router = Router();
const path = require('path');

router.post('/compare', middlewareCompare, controller.compareStrings);

router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', '..', 'public', 'index.html'));
});

module.exports = router;