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

const TaskHeadDBController = require('../../../models/task/taskhead.controller.js');
const test_members = [
    {name: 'member1', email: 'email_member1', tasks: []}
];
const test_taskhead = {
    title: 'titleOfTaskHead',
    order: [
        {member: 'member1', order: 0}
    ],
    members: test_members
};

describe('TaskHeadDBController - need the accessToken to access API resources ', () => {

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

        it('POST /taskheads/', done => {
            request
                .post('/taskheads/')
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

    describe('Update, Delete a taskhead', () => {

        let taskHead;
        beforeEach(done => {
            TaskHeadDBController.deleteAll(err => {

                TaskHeadDBController.create(test_taskhead, (err, newTaskHead) => {
                    taskHead = newTaskHead;
                    done();
                });

            });
        });
        // after(done => {
        //     TaskHeadDBController.deleteAll(err => {
        //         done();
        //     });
        // });

        it('DELETE /taskheads/:id returns 200', done => {
            request
                .delete('/taskheads/' + taskHead.id)
                .set({Authorization: 'Bearer' + ' ' + accessToken})
                .expect(200)
                .end((err, res) => {
                    if (err) throw err;
                    res.status.should.equal(200);
                    done();
                });
        });
        it('DELETE /taskheads/wrongId returns 400', done => {
            request
                .delete('/taskheads/' + 'wrongId')
                .set({Authorization: 'Bearer' + ' ' + accessToken})
                .expect(400)
                .end((err, res) => {
                    if (err) throw err;
                    res.status.should.equal(400);
                    done();
                });
        });

        it('PUT /taskheads/:id returns 401 - with wrong taskhead id', done => {
            const newMembers = [
                {name: 'member2', email: 'email_member2', tasks: []}
            ];
            request
                .put('/taskheads/' + 'wrongId')
                .set({Authorization: 'Bearer' + ' ' + accessToken})
                .send({details: {title: test_taskhead.title, members: newMembers}})
                .expect(401)
                .end((err, res) => {
                    if (err) throw err;
                    res.status.should.equal(401);
                    done();
                });
        });

        it('PUT /taskheads/:id', done => {
            const newMembers = [
                {name: 'member2', email: 'email_member2', tasks: []}
            ];
            request
                .put('/taskheads/' + taskHead.id)
                .set({Authorization: 'Bearer' + ' ' + accessToken})
                .send({details: {title: test_taskhead.title, members: newMembers}})
                .expect(200)
                .end((err, res) => {
                    if (err) throw err;
                    res.status.should.equal(200);
                    done();
                });
        });

        it('PUT /taskheads/:id returns 401 - with existing members ', done => {
            let existingMembers = taskHead.members;
            request
                .put('/taskheads/' + taskHead.id)
                .set({Authorization: 'Bearer' + ' ' + accessToken})
                .send({details: {title: test_taskhead.title, members: existingMembers}})
                .expect(400)
                .end((err, res) => {
                    if (err) throw err;
                    res.status.should.equal(400);
                    done();
                });
        });

        it('PUT /taskheads/:taskheadid/member/:memberid returns 200', done => {
            request
                .put('/taskheads/' + taskHead.id + '/member/' + taskHead.members[0].id)
                .set({Authorization: 'Bearer' + ' ' + accessToken})
                .expect(200)
                .end((err, res) => {
                    if (err) throw err;
                    res.status.should.equal(200);
                    done();
                });
        });

        it('PUT /taskheads/:taskheadid/member/:memberid  - without memberId returns 400', done => {
            let wrongMemberId = 'sdf';
            request
                .put('/taskheads/' + taskHead.id + '/member/' + wrongMemberId)
                .set({Authorization: 'Bearer' + ' ' + accessToken})
                .expect(400)
                .end((err, res) => {
                    if (err) throw err;
                    res.status.should.equal(400);
                    done();
                });
        });
    });

    describe('Delete taskHeads', () => {

        const members = [
            {name: 'member0', email: 'email_member1', tasks: []},
            {name: 'member1', email: 'email_member1', tasks: []},
        ];
        const taskHeads = [
            {title: 'titleOfTaskHead0', order: [{member: 'member0', order: 0}], members: members},
            {title: 'titleOfTaskHead1', order: [{member: 'member0', order: 1}], members: members},
            {title: 'titleOfTaskHead2', order: [{member: 'member0', order: 2}], members: members}
        ];

        let savedTaskHeads = [];
        beforeEach(done => {
            savedTaskHeads.length = 0;
            TaskHeadDBController.deleteAll(err => {

                // Create 3 taskHeads
                taskHeads.forEach((taskHead, i) => {
                    TaskHeadDBController.create(taskHead, (err, newTaskHead) => {
                        savedTaskHeads.push(newTaskHead);

                        if (taskHeads.length - 1 === i) {
                            done();
                        }
                    });
                });
            });
        });

        it('DELETE /taskheads/ returns 200', done => {

            let deletingTaskHeadIds = [];
            for (let i = 0; i < savedTaskHeads.length; i++) {
                deletingTaskHeadIds.push(savedTaskHeads[i].id);
            }

            request
                .delete('/taskheads/')
                .set({Authorization: 'Bearer' + ' ' + accessToken})
                .expect(200)
                .send({ids: deletingTaskHeadIds})
                .end((err, res) => {
                    if (err) throw err;
                    res.status.should.equal(200);
                    done();
                });
        });

        it('DELETE /taskhead/ - deletingTaskHeadIds is undefined - returns 400', done => {
            request
                .delete('/taskheads/')
                .set({Authorization: 'Bearer' + ' ' + accessToken})
                .expect(400)
                .end((err, res) => {
                    if (err) throw err;
                    res.status.should.equal(400);
                    done();
                });
        });
    });

    describe('GET taskHeads ', () => {

        const membersA = [
            {name: 'member0', email: 'email_member0', tasks: []},
            {name: 'member1', email: 'email_member1', tasks: []},
        ];
        const membersB = [
            {name: 'member1', email: 'email_member1', tasks: []},
            {name: 'member2', email: 'email_member2', tasks: []},
        ];

        const taskHeads = [
            {title: 'titleOfTaskHead0', order: [{member: 'member0', order: 0}], members: membersA},
            {title: 'titleOfTaskHead1', order: [{member: 'member0', order: 1}], members: membersB},
            {title: 'titleOfTaskHead2', order: [{member: 'member0', order: 2}], members: membersB}
        ];

        let savedTaskHeads = [];
        beforeEach(done => {
            savedTaskHeads.length = 0;
            TaskHeadDBController.deleteAll(err => {

                // Create 3 taskHeads
                taskHeads.forEach((taskHead, i) => {
                    TaskHeadDBController.create(taskHead, (err, newTaskHead) => {
                        savedTaskHeads.push(newTaskHead);

                        if (taskHeads.length - 1 === i) {
                            done();
                        }
                    });
                });
            });
        });

        it('GET /taskheads/:name - there is no taskheads of the member - returns 400', done => {
            // Delete All taskheads, no taskheads of 'member2'
            TaskHeadDBController.deleteAll(err => {
            });

            request
                .get('/taskheads/' + membersB[1].name)
                .set({Authorization: 'Bearer' + ' ' + accessToken})
                .expect(400)
                .end((err, res) => {
                    if (err) throw err;
                    res.status.should.equal(400);
                    done();
                });
        });

        it('GET /taskheads/:name - member0 - returns 200', done => {
            request
                .get('/taskheads/' + membersA[0].name)
                .set({Authorization: 'Bearer' + ' ' + accessToken})
                .expect(200)
                .end((err, res) => {
                    if (err) throw err;
                    res.status.should.equal(200);
                    res.body.should.have.property('taskheads');
                    done();
                });
        });
    });

});