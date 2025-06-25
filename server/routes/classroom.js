const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

const Classroom = require('../models/Classroom');
const User = require('../models/User');
const Poll = require('../models/Poll');

//POST -> /api/classroom -> create a classroom
router.post('/', auth, async (req,res)=>{
    if(req.user.role != 'teacher') return res.status(403).json({error: 'only teachers can create a classroom'});
    const {name, description} = req.body;
    if(!name) return res.status(400).json({error: 'Name is required'});
    const classroom = await Classroom.create({name, description, teacher: req.user.userId});
    res.json(classroom);
})

//GET -> /api/classroom -> get all classrooms created by a particular taecher
router.get('/mine', auth, async(req, res)=> {
    if(req.user.role != 'teacher') return res.status(403).json({error: 'only teachers can see their classroom'});
    const classes = await Classroom.find({teacher: req.user.userId});
    res.json(classes);
})

//POST -> /api/classroom/:id/join -> student request to join a classroom 
router.post('/:id/join', auth, async (req, res)=>{
    if(req.user.role != 'student') return res.status(403).json({erroe: 'Only students can resqurst to join a classroom'});

    const classroom = await Classroom.findById(req.params.id);
    if(!classroom) return res.status(404).json({error: 'Classroom not found'});

    const studentId = req.user.userId;

    //if already approved 
    if(classroom.students.includes(studentId)) return res.status(400).json({error: 'You are already a member of this classroom'});
    //if already requested
    if(classroom.pendingRequests.includes(studentId)) return res.status(400).json({error: 'You have already requested to join this classroom'});
    //add to requests
    classroom.pendingRequests.push(studentId);
    await classroom.save();
    res.json({message: 'Request to join classroom sent successfully'});
})

// GET /api/classrooms/all - list all classrooms
router.get('/all', async (req, res) => {
    const classes = await Classroom.find().select('name description');
    res.json(classes);
  });

//PATCH -> /api/classroom/:classroomId/approve/:studentId -> approve a student request to join a classroom
router.patch('/:classroomId/approve/:studentId', auth, async(req, res)=>{
    if(req.user.role !== 'teacher') return res.status(403).json({error: 'Only teachers can approve requests'});
    const classroom = await Classroom.findById(req.params.classroomId);
    if(!classroom) return res.status(404).json({error: 'Classroom not found'});

    const studentId = req.params.studentId;

    //checking if teacher owns this classroom
    if(!classroom.teacher.equals(req.user.userId)) return res.status(403).json({error: 'You are not authorized to approve requests for this classroom'});
    //if student is already a member
    if(!classroom.pendingRequests.includes(studentId)) return res.status(400).json({error: 'This student has not requested to join this classroom'});
    //approve the request
    classroom.pendingRequests = classroom.pendingRequests.filter((id) => id.toString() !== studentId);
    classroom.students.push(studentId);
    await classroom.save();
    res.json({message: 'Student approved successfully'});
}) 

//GET -> /api/classroom/:id/requests -> get all requests for a classroom
router.get('/:id/requests', auth, async (req, res) => {
    if(req.user.role !== 'teacher') return res.status(403).json({error: 'Only teachers can view requests'});
    const classroom = await Classroom.findById(req.params.id).populate('pendingRequests', 'name email');
    //checking if classroom exists
    if(!classroom) return res.status(404).json({error: 'Classroom not found'});
    //checking if teacher owns this classroom
    if(!classroom.teacher.equals(req.user.userId)) return res.status(403).json({error: 'You are not authorized to view requests for this classroom'});
    res.json(classroom.pendingRequests);
})

// GET /api/classrooms/mine - for students to get classrooms they are in
router.get('/student/mine', auth, async (req, res) => {
    if (req.user.role !== 'student') {
      return res.status(403).json({ error: 'Only students can view this' });
    }
  
    const classrooms = await Classroom.find({ students: req.user.userId }).select('name description');
    res.json(classrooms); // each with _id, name, desc
  });




  // GET /api/classrooms/:id/polls - get polls for this classroom
  router.get('/:id/polls', auth, async (req, res) => {
    if (req.user.role !== 'teacher') return res.status(403).json({ error: 'Only teachers can view poll history' });
  
    const classroom = await Classroom.findById(req.params.id);
    if (!classroom) return res.status(404).json({ error: 'Classroom not found' });
  
    if (!classroom.teacher.equals(req.user.userId)) return res.status(403).json({ error: 'You do not own this classroom' });
  
    const polls = await Poll.find({ classroom: req.params.id })
      .sort({ createdAt: -1 }); // most recent first
  
    res.json(polls);
  });
  
  

module.exports = router;