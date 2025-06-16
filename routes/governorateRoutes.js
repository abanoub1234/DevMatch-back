const express = require('express');
const router = express.Router();
const governorateController = require('../controllers/governorateController');

router.get('/', governorateController.getAllGovernorates);
router.get('/:id', governorateController.getGovernorateById);
router.post('/', governorateController.createGovernorate);
router.put('/:id', governorateController.updateGovernorate);
router.delete('/:id', governorateController.deleteGovernorate);

module.exports = router;
