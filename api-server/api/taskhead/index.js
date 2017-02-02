const express = require('express');
const router = express.Router();

const controller = require('./taskhead.controller');

router.post('/', controller.create);

router.delete('/:id', controller.deleteOne);

// Update details - title, members
router.put('/:id', controller.updateDetails);

// Delete tasks
router.delete('/', controller.deleteMulti);

// Read taskHeads of the user

module.exports = router;