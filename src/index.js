require('./db/mongoose');
const express = require('express');
const app = express();

const userRouter = require('./router/User');
const taskRouter = require('./router/Task');

const port = process.env.PORT ;

app.use(express.json());
app.use('/users',userRouter);
app.use('/tasks',taskRouter);


app.listen(port , ()=>{
    console.log('Sarted server on port : ', port);
});


