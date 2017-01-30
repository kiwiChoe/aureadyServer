const TaskHeadDBController = require(__appbase_dirname + '/models/task/taskhead.controller');

exports.create = (req, res) => {

    TaskHeadDBController.create(req.body.taskHeadInfo, (err, newTaskHead) => {
        if(err) {
            return res.sendStatus(400);
        }
        return res.sendStatus(201);
    });
};

exports.delete = (req, res) => {
    TaskHeadDBController.delete(req.params.id, (err, isRemoved) => {
        if(err) {
            return res.sendStatus(400);
        }
        if(!isRemoved) {
            return res.sendStatus(400);
        } else {
            return res.sendStatus(200);
        }
    });
};

exports.update = (req, res) => {

    const updatingTaskHead = req.body.taskHead;
    const query = {_id: req.params.id};
    const options = updatingTaskHead;
    TaskHeadDBController.update(query, options, (err, result) => {
        if(err) {
            return res.sendStatus(400);
        }
        if(!result.n) {
            return res.sendStatus(400);
        } else {
            return res.sendStatus(200);
        }
    });
};
