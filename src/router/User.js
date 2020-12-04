const express = require('express');
const User = require('../models/user');
const auth = require('../middleware/auth');
const sharp = require('sharp');
const router = express.Router();
const { sendWelcomeMail, sendCancelationMain } = require('../emails/account')

const multer = require('multer');
const upload = multer({
    limits : {
        fileSize : 1000000
    },
    fileFilter(req, file, cb){
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/))
            return cb(new Error('Please upload either jpg, jpeg, png'));

        cb(undefined, true)
    }
});

router.post("" , async (req, res)=>{
    const user = new User(req.body);
    console.log('User :: '+ user);
    try {
        console.log('MongoDB URL ::: '+process.env.MONGODB_URL);
        console.log('Before saving');
        await user.save();
        console.log('Áfter saving');
        sendWelcomeMail(user);
        console.log('Áfter sending mail');
        const token = await user.generateAuthToken();
        console.log('Áfter generating token');
        res.status(201).send({ user , token});
    } catch (error) {
        console.log(error);
        res.status(400).send({
            error : error
        });
    }
})

router.post('/login', async (req, res)=>{
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password);
        const token = await user.generateAuthToken();
        res.send({ user , token});
    } catch (error) {
        res.status(400).send(error);
    }
})

router.post('/logout', auth, async (req, res)=>{
    try {
        const user = req.user;
        user.tokens = user.tokens.filter((tokenObj)=>{
            return tokenObj.token !== req.token;
        });
        await user.save();
        res.send();
    } catch (error) {
        res.status(500).send(error);
    }
})

router.post('/logout/all', auth, async (req, res)=>{
    try {
        const user = req.user;
        user.tokens = [];
        await user.save();
        res.send();
    } catch (error) {
        res.status(500).send(error);
    }
})

router.get("/current", auth, async (req, res)=>{
    try {
        const user = req.user;
        if(!user)
            throw new Error();
        res.status(200).send(user);
    } catch (error) {
        res.status(500).send(error);
    }
})

router.patch('/current', auth, async (req, res)=>{
    const updates = Object.keys(req.body);
    const allowUpdate = ['name', 'email', 'password', 'age'];
    const isValid = updates.every((update)=> allowUpdate.includes(update)); 

    if(!isValid){
        res.status(400).send({error : 'Invalid updates!'});
    }
    try {
        const user = req.user;
        updates.forEach((update)=> user[update] = req.body[update])
        await user.save();

         if(!user)
            return res.status(404).send();
        res.send(user);
    } catch (error) {
        res.status(400).send(error);
    }
});

router.delete('/current', auth, async (req, res)=>{
        try {
            await req.user.remove();
            sendCancelationMain(req.user);
            res.send(req.user);
        } catch (error) {
            res.status(400).send(error);
        }
});

router.post('/avatar', auth, upload.single('avatar'), async (req, res)=>{
    const buffer = await sharp(req.file.buffer)
                        .resize({ width: 250, height : 250 })
                        .png()
                        .toBuffer();
    req.user.avatar = buffer;
    await req.user.save();
    res.send();
},
(error , req, res, next)=>{
        res.status(404).send({
            error : error.message
        });
})  

router.delete('/avatar', auth, async (req, res)=>{
    req.user.avatar = undefined;
    await req.user.save();
    res.send();
})

router.get('/avatar/show', auth, (req, res)=>{
    try {
        if(!req.user || !req.user.avatar)
            throw new Error('Profile avatar is not present');
        
        res.set('Content-Type', 'image/png');
        res.send(req.user.avatar);
    } catch (error) {
        res.status(404).send({
            message : error.message
        })
    }
})

module.exports = router;