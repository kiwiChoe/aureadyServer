const express = require('express');
const router = express.Router();

const controller = require('./task.controller');

router.post('/:memberid', controller.create);

// Delete tasks
router.delete('/', controller.deleteMulti);

// Delete a task
router.delete('/:id', controller.delete);

// Update all tasks of a taskhead
router.put('/:taskheadid', controller.updateMulti);

module.exports = router;