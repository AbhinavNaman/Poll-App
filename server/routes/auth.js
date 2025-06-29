const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Import the User model

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

//POST /api/auth/register
router.post('/register', async (req, res)=>{
    const {name, email, password, role} = req.body;

    if(!['student', 'teacher'].includes(role)){
        return res.status(400).json({error: 'Invalid role'});
    }

    //checking if user exist already
    const existingUser = await User.findOne({email});
    if(existingUser){
        return res.status(400).json({error: 'User already exists'});
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = await User.create({name, email, role, passwordHash});

    const token = jwt.sign(
        {userId: newUser._id, role: newUser.role},
        JWT_SECRET,
        {expiresIn: '7d'}
    );

    res.json({token, user: {name: name, email, role}});
});

//POST /api/auth/login
router.post('/login', async (req, res)=>{
    const {email, password} = req.body;
    const user = await User.findOne({email});
    if(!user)  return res.status(400).json({error: 'Invalid credential'});
    const valid = await bcrypt.compare(password, user.passwordHash);
    if(!valid) return res.status(400).json({error: 'Invalid credential'});
    const token = jwt.sign({ userId: user._id, role: user.role}, JWT_SECRET, {expiresIn: '7d'});
    res.json({token, user: {name: user.name, email: user.email, role: user.role}});
})

module.exports = router;