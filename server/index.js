const express = require('express');
const http = require('http'); // We need the Node.js core http module to create a server that both Express and Socket.IO can use. Socket.IO needs low-level HTTP server access for handling WebSocket upgrades.
const cors = require('cors');
const { Server } = require('socket.io');
const mongoose = require('mongoose');


const Poll = require('./models/Poll'); // Import the Poll model
const Classroom = require('./models/Classroom');// Import the Classroom model

const authRoutes = require('./routes/auth'); // Import the auth routes
const auth = require('./middleware/auth'); // Import the auth middleware for protected routes
const classroomRoutes = require('./routes/classroom'); // Import the classroom routes

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes); // Use the auth routes for handling authentication
app.use('/api/classroom', classroomRoutes); // Use the classroom routes with authentication middleware
//app.use(cors({ origin: 'http://localhost:3000' }));

mongoose.connect('mongodb+srv://mongodb:mongodb@poll-socketio.ofau4wc.mongodb.net/?retryWrites=true&w=majority&appName=poll-socketio', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(()=>{
    console.log('Connected to MongoDB');
}).catch((err)=>{
    console.log('Error connecting to MongoDB:', err);
})


const server = http.createServer(app); //Creates a raw HTTP server from the Express app

//binds the socket.io to the HTTP server
const io = new Server(server, {
    cors:{
        origin:'*',
        methods: ["GET", "POST"],
    }
})

let students = {}; // stores the student name with their socket.id
let answer = {};
let questions = {};

let currentPoll = null;
let pollAnswers = {};
let pollTimer = null;

//This listens for new socket connections
io.on('connection', (socket)=>{
    // console.log('A user connected:', socket.id); //socket.id :  unique identifier assigned to this connection

    //handing incoming message
    socket.on('message', (data)=>{
        // console.log('Message received: ', data);
        // emit/broadcast the message to all the connected clients
        io.emit('message', data);
    })

    socket.on('student_joined', ({name})=>{
        students[socket.id] = {name, socket}; // store the student name with their socket.id
        updateStudentList();
        console.log(`student joined: ${name} with id: ${socket.id}`);
    })

    socket.on('join_classroom', (classroomId) => {
        socket.join(classroomId);
        console.log(`✅ ${socket.id} joined classroom ${classroomId}`);
      });
      

    socket.on('request_student_list', ()=>{
        const list = Object.values(students).map(student => student.name);
        socket.emit('student_list', list);
    })

    socket.on('new_question', async ({classroomId, question, options, duration})=>{
        // console.log(`New question received: ${question}`);
        // console.log(`Options: ${options}`);
        const classroom = await Classroom.findById(classroomId);
        if(!classroom) return;

        const totalStudents = classroom.students.length;

        const poll = await Poll.create({
            classroom: classroomId,
            question,
            options,
            duration,
            totalStudents
        });

        questions[question] = options; // store the question and options

        const pollDuration = duration ? duration : 60;

        currentPoll = {_id: poll._id, classroomId, question, options, duration: pollDuration, totalStudents};
        pollAnswers = {}

        pollTimer = setTimeout(() => {
            emitPollResult();
          }, duration * 1000);

          console.log(currentPoll, 'currentPoll');
        
          // Emit poll ONLY to students in that classroom
          io.to(classroomId).emit('poll', currentPoll);
    })

    socket.on('kick_student', ({name})=>{
        const studentEntry = Object.entries(students).find(([key, value])=> value.name === name);
        if(!studentEntry) return;
        const [socketId, student] = studentEntry;

        student.socket.emit('kicked', {message: 'You have been kicked from the session.'});

        delete students[socketId];
        delete pollAnswers[student.name];

        updateStudentList();
    })

    socket.on('submit_poll', ({question, option, studentName})=>{
        // console.log(`poll submitted by ${studentName}: ${question} - ${option}`);
        // Store the answer in the answer object
        answer[studentName] = option;

        pollAnswers[studentName] = option;

        // socket.join(classroomId);

        //emitting live votes
        console.log('emitting live votes:', {
            total: Object.keys(students).length,
            answered: Object.keys(pollAnswers).length,
        })

        console.log(students)

        io.emit('live_votes', {
            total: Object.keys(students).length,
            answered: Object.keys(pollAnswers).length,
        })

        //checking if all the students have submitted their answers before 60s
        if(Object.keys(pollAnswers).length === Object.keys(students).length){
            // console.log('All students have submitted their answers');
            clearTimeout(pollTimer); // clear the timer if all students have submitted their answers
            emitPollResult();
        }
    })

    socket.on('disconnect', ()=>{
        const name = students[socket.id];
        // console.log(`A user disconnected : ${socket.id} (${name})`);
        delete students[socket.id]; // remove the student from the list when they disconnect
        delete pollAnswers[name];
        updateStudentList();
    })
})

const emitPollResult = async ()=>{
    if(!currentPoll) return;
    console.log("Emitting results for:", currentPoll);

    const resultCount = {};
    // Count the number of votes for each option
    Object.values(pollAnswers).forEach(option => {
        resultCount[option] = (resultCount[option] || 0)+1;
    })

    await Poll.findByIdAndUpdate(currentPoll._id, {
        results: resultCount,
        answeredCount: Object.keys(pollAnswers).length,
    });
         
      io.to(currentPoll.ClassroomId).emit('poll_result', {
        question: currentPoll?.question,
        options: currentPoll?.options,
        results: resultCount,
        totalStudents: currentPoll?.totalStudents,
      });

    
    // Reset the current poll after emitting the results
    currentPoll = null;
    pollAnswers = {};
    pollTimer = null;
    // Resetting the questions and answers  
}

const updateStudentList =()=> {
    const list = Object.values(students).map(student => student.name);
    io.emit('student_list', list);
}

app.get('/api/polls', async (req, res) => {
    try {
        const polls = await Poll.find().sort({ timestamp: -1 });
        res.json(polls);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch polls' });
    }
})

// app.get('api/classrooms', auth, async (req, res)=>{
//     //
// })

const PORT = process.env.PORT || 8000;
server.listen(PORT, ()=>{
    console.log(`Server is running on port ${PORT}`);
})