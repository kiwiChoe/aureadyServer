
const localAccountRouter = require('./api/local-account');
const socialAccountRouter = require('./api/social-account');
const userRouter = require('./api/user');

exports.initialize = (app) => {
    // Set Passport

    // Set API routes
    // enter into router, when start the path, ex.'/signup-account/*'
    app.use('/local-account', localAccountRouter);
    app.use('/social-account', socialAccountRouter);
    app.use('/users', userRouter);
};

