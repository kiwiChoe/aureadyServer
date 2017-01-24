process.env.dbURI = 'test';

const assert = require('assert');
const should = require('should');
const server = require('../../../www');
const request = require('supertest')(server);

const Token = require('../../../models/token.controller');
const predefine = require('../../../auth-server/util/predefine');
const clientId = 'tEYQAFiAAmLrS2Dl';

const User = require('../../../models/user.controller');
const name = 'nameofkiwi3';
const email = 'kiwi3@gmail.com';
const password = '123';

const TaskHeadController = require('../../../models/task/taskhead.controller.js');
const TaskHead = require('../../../models/task/taskhead');
const test_tasks = [
    {order: 0, description: 'des', detailNote: 'detailnote', completed: false},
    {order: 1, description: 'des1', detailNote: 'detailnote1', completed: false},
    {order: 2, description: 'des2', detailNote: 'detailnote2', completed: false},
    {order: 3, description: 'des3', detailNote: 'detailnote3', completed: false}
];
const test_members = [
    {name: 'member1', email: 'email_member1', tasks: test_tasks}
];
const test_taskhead = {
    title: 'titleOfTaskHead',
    order: [
        {member: 'member1', order: 0}
    ],
    members: test_members
};

describe('TaskHead', () => {

    let accessToken;
    before(done => {
        // Register user first
        User.create(name, email, password, true, (err, user, info) => {
            // Add Token
            Token.create(clientId, user.id, predefine.oauth2.type.password, (err, newToken) => {
                accessToken = newToken.accessToken;
                done();
            });
        });
    });
    after(done => {
        // delete all the users
        User.deleteAll(err => {
            Token.deleteAll(err => {
                done();
            });
        });
    });
    describe('Create a taskHead', () => {

        it('POST /taskhead/', done => {
            request
                .post('/taskhead/')
                .set({Authorization: 'Bearer' + ' ' + accessToken})
                .send({
                    taskHeadInfo: test_taskhead
                })
                .expect(201)
                .end(err => {
                    if (err) throw err;
                    done();
                });
        });
    });

    describe('There is a taskHead in DB for UPDATE, DELETE test', () => {

        let taskHead;
        beforeEach(done => {
            TaskHeadController.create(test_taskhead, (err, newTaskHead) => {
                taskHead = newTaskHead;
                done();
            });

        });
        after(done => {
            TaskHeadController.deleteAll(err => {
                done();
            });
        });

        it('DELETE /taskhead/:id returns 200', done => {
            request
                .delete('/taskhead/' + taskHead.id)
                .set({Authorization: 'Bearer' + ' ' + accessToken})
                .expect(200)
                .end((err, res) => {
                    if (err) throw err;
                    res.status.should.equal(200);
                    done();
                });
        });
        it('DELETE /taskhead/wrongId returns 400', done => {
            request
                .delete('/taskhead/' + 'wrongId')
                .set({Authorization: 'Bearer' + ' ' + accessToken})
                .expect(400)
                .end((err, res) => {
                    if (err) throw err;
                    res.status.should.equal(400);
                    done();
                });
        });


        it('PUT /taskhead/', done => {
            const updatingTaskHead = test_taskhead;
            updatingTaskHead.title = 'updating title';
            request
                .put('/taskhead/' + taskHead.id)
                .set({Authorization: 'Bearer' + ' ' + accessToken})
                .send({taskHead: updatingTaskHead})
                .expect(200)
                .end((err, res) => {
                    if (err) throw err;
                    res.status.should.equal(200);
                    // res.body.should.have.property('taskHead');
                    done();
                });
        });
    });

});