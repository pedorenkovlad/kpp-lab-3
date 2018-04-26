const express = require('express');
const router = express.Router();
const UserModel = require('../models/users.js'); // Requiring our Users Model from MongoDB

router.get('/', (req, res) => {
    res.render('index', { title: "Welcome" })
})

router.get('/profile', (req, res, next) => {

    if ( !req.session.userId ) {    // If there's no session.userId then user is not logged in
        const err = new Error("You are not authorized to view this page");
        err.status = 403;   // Forbidden
        return next(err)
    } 
    UserModel.findById(req.session.userId).exec()
        .then( user => {
            let tasksList = []; // List of incompleted tasks
            let doneList = [];  // List of completed tasks

            user["task"].forEach( item => {
                if(item.completed) {
                    doneList.push(item);
                }
                else{ 
                    tasksList.push(item);
                }
            });

            res.render('profile', {
                title: 'Profile', 
                name: user.name,
                tasksList: tasksList,
                doneList: doneList
            });
        })
        
        .catch( err => {
            console.error(err);
        })
});

router.get('/register', (req, res, next) => {
    res.render('register', { title: 'Register' });
});

router.post('/register', (req, res, next) => {
    // Check that all fields are filled
    if (req.body.email &&
        req.body.name && 
        req.body.password && 
        req.body.confirmPassword) {
        // Check if passwords match
        if (req.body.password !== req.body.confirmPassword) {
            let err = new Error('Passwords do not match');
            err.status = 400;
            return next(err);
        }

        // Create user profile to be store in database 
        const userData = {
            name: req.body.name,
            email: req.body.email,
            password: req.body.password
        };

        UserModel.create(userData, (err, user) => {
            if(err) {
                return next(err);
            }
            else{
                req.session.userId = user._id; // Assign the _id of the new created user to the req.session obj
                return res.redirect('/profile');
            }
        });
    } 
    else {
        let err = new Error('All fields required');
        err.status = 400;
        return next(err);
    }
});

// GET /login
router.get('/login', (req, res, next) => {
    return res.render('login', { title: 'Log In'});
})

router.post('/login', (req, res, next) => {
    if (req.body.email && req.body.password) {
        UserModel.authenticate(req.body.email, req.body.password, (error, user) => {
            if ( error || !user ) {
                const err = new Error('Wrong email or password');
                err.status = 401;
                return next(err);
            }
            else {
                
                req.session.userId = user._id;
                return res.redirect('/profile');
            }
        });
    }
    else {
        const err = new Error('Email and password are required');
        err.status = 401;
        return next(err);
    }
})

// Create a task
router.post('/tasks', (req, res, next) => {

    if(req.body.task) {
        const updateTaskId = req.session.userId;    // Users's session id which is equal to its id in our MongoDB
        
        UserModel.findById(updateTaskId, (err, toUpdateUser) => {
            if (err) throw err;

            const newUserTask = {
                taskItem: req.body.task,
                completed: false
            };
            // Add taskItem to the corresponding user array of tasks
            toUpdateUser.task.push(newUserTask);

            toUpdateUser.save( (err, updateTask) => {
                if (err) throw err;
            })
        });

        res.redirect('/profile');
    }
});

// Remove task 
router.delete('/remove/:id', (req, res) => {
    // Task to be removed
    const removeTaskId = req.params.id;
    const sessionId = req.session.userId;

    UserModel.findById(sessionId, (err, user) => {
        if (err) throw err;
        
        user["task"].forEach( item => {
            if (item._id == removeTaskId) {
                let indexToRemove = user["task"].indexOf(item);
                user["task"].splice(indexToRemove, 1);
            }
            
        });
        // The SAVE method in Mongoose is asyncronous, so the responses (res.send / res.redirect / etc) 
        // need to be passed in the callback function
        user.save((err) => { 
            if (err) throw err;
            console.log(`Task: ${removeTaskId} has been removed from MongoDB`);
            res.send("OK");
        });
    })


});

// Update task to -> complete: true;
router.put('/tasks', (req, res) => {
    const updateTaskId = req.body.taskId;   // Item to be updated
    
    const sessionId = req.session.userId;

    UserModel.findById(sessionId, (err, user) => {
        if (err) throw err;
        
        user["task"].forEach( item => {
            if (item._id == updateTaskId) {
                item.completed = true;
            }
        });

        user.save((err) => {
            if (err) throw err;
            console.log(`Task: ${updateTaskId} has been updated`);
            res.send("OK");
        });
    })
    

})

router.get('/logout', (req, res, next) => {
    if (req.session) {
        req.session.destroy(err => { // Remove req.session obj
            if (err) {
                return next(err); 
            }
            else {
                res.redirect('/');
            }
        })
    }
})

module.exports = router;