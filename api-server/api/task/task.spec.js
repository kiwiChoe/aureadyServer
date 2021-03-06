process.env.dbURI = 'test';

const assert = require('assert');
const should = require('should');
const server = require('../../../www');
const request = require('supertest')(server);

const Token = require('../../../models/token.controller');
const predefine = require('../../../predefine');
const clientId = predefine.trustedClientInfo.clientId;

const User = require('../../../models/user.controller');
const name = 'nameofkiwi3';
const email = 'kiwi3@gmail.com';
const password = '123';

const TaskHeadDBController = require('../../../models/task/taskhead.controller.js');
const test_tasks = [
    {id: 'stubbedTaskId0', description: 'des', completed: false, order: 0},
    {id: 'stubbedTaskId1', description: 'des1', completed: false, order: 0},
    {id: 'stubbedTaskId2', description: 'des2', completed: false, order: 0}
];
const test_tasks1 = [
    {id: 'stubbedTaskId3', description: 'des3', completed: false, order: 0},
    {id: 'stubbedTaskId4', description: 'des4', completed: false, order: 0},
    {id: 'stubbedTaskId5', description: 'des5', completed: false, order: 0}
];
const test_members = [
    {id: 'stubbedMemberId0', name: 'member0', email: 'email_member0', tasks: test_tasks},
    {id: 'stubbedMemberId1', name: 'member1', email: 'email_member1', tasks: test_tasks1}
];
const test_taskhead = {
    id: 'stubbedTaskHeadId',
    title: 'titleOfTaskHead',
    members: test_members
};

const TaskController = require('../../../models/task/task.controller.js');

const taskObj = {
    id: 'stubbedTaskId',
    description: 'desUPDATE!!!!!',
    completed: true,
    order: 0
};

describe('Task - need the accessToken to access API resources and pre saved TaskHeadDBController', () => {
    let accessToken;
    let savedTaskHead;
    before(done => {
        // Register user first
        User.create(name, email, password, true, (err, user, info) => {
            // Add Token
            Token.create(clientId, user.id, predefine.oauth2.type.password, (err, newToken) => {
                accessToken = newToken.accessToken;
                TaskHeadDBController.create(test_taskhead, (err, newTaskHead) => {
                    savedTaskHead = newTaskHead;
                    done();
                });
            });
        });
    });
    after(done => {
        // delete all the users
        User.deleteAll(err => {
            Token.deleteAll(err => {
                TaskHeadDBController.deleteAll(err => {
                    done();
                });
            });
        });
    });

    describe('POST /tasks', () => {
        it('it should not POST a task without memberId field and returns 404', done => {
            request
                .post('/tasks/')
                .set({Authorization: 'Bearer' + ' ' + accessToken})
                .send({task: taskObj})
                .expect(404)
                .end((err, res) => {
                    if (err) throw err;
                    res.status.should.equal(404);
                    done();
                });
        });
        it('it should POST a task and returns 201', done => {

            const taskInfo = {
                id: taskObj.id,
                description: taskObj.description,
                completed: taskObj.completed,
                order: taskObj.order
            };
            request
                .post('/tasks/' + savedTaskHead.members[0].id)
                .set({Authorization: 'Bearer' + ' ' + accessToken})
                .send(taskInfo)
                .expect(201)
                .end((err, res) => {
                    if (err) throw err;
                    res.status.should.equal(201);
                    done();
                });
        });
    });

    describe('DELETE or PUT /tasks', () => {

        it('PUT /tasks/ - no params returns 404', done => {
            request
                .put('/tasks/taskhead/')
                .set({Authorization: 'Bearer' + ' ' + accessToken})
                .expect(404)
                .end((err, res) => {
                    if (err) throw err;
                    res.status.should.equal(404);
                    done();
                });
        });

        it('PUT /tasks/taskhead/:id 1 returns 200', done => {
            const updatingTasks = [
                {id: test_tasks[0].id, description: 'updating DES0', completed: false, order: 0},
                {id: test_tasks[1].id, description: 'updating DES1', completed: false, order: 0}];
            const updatingTasks1 = [
                {id: test_tasks1[0].id, description: 'updating DES3', completed: false, order: 0},
                {id: test_tasks1[1].id, description: 'updating DES4', completed: false, order: 0}];
                const memberTasks = [
                    {memberid: test_members[0].id, tasks: updatingTasks},
                    {memberid: test_members[1].id, tasks: updatingTasks1}
                ];
            request
                .put('/tasks/taskhead/' + test_taskhead.id)
                .set({Authorization: 'Bearer' + ' ' + accessToken})
                .send(memberTasks)
                .expect(200)
                .end((err, res) => {
                    if (err) throw err;
                    res.status.should.equal(200);
                    done();
                });
        });

        it('PUT /tasks/member/:id value returns 200', done => {
            const updatingTasks = [
                {id: test_tasks[0].id, description: 'updating DES0', completed: false, order: 0},
                {id: test_tasks[1].id, description: 'updating DES1', completed: false, order: 0}];

            request
                .put('/tasks/member/' + test_members[0].id)
                .set({Authorization: 'Bearer' + ' ' + accessToken})
                .send(updatingTasks)
                .expect(200)
                .end((err, res) => {
                    if (err) throw err;
                    res.status.should.equal(200);
                    done();
                });
        });
        it('PUT /tasks/member/ returns 404', done => {
            request
                .put('/tasks/member/')
                .set({Authorization: 'Bearer' + ' ' + accessToken})
                .expect(404)
                .end((err, res) => {
                    if (err) throw err;
                    res.status.should.equal(404);
                    done();
                });
        });

        it('GET /tasks/:memberid returns 200', done => {
            request
                .get('/tasks/' + test_members[0].id)
                .set({Authorization: 'Bearer' + ' ' + accessToken})
                .expect(200)
                .end((err, res) => {
                    if (err) throw err;
                    res.status.should.equal(200);
                    done();
                });
        });
    });
});