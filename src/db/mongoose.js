const mongoose = require('mongoose');
const User = require('../models/user');

mongoose.connect( process.env.MONGODB_URL , {
    useNewUrlParser : true,
    useCreateIndex : true,
    useFindAndModify : false
});