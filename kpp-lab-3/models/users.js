const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Define Schema
const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true
    },
    name: {
        type: String, 
        required: true
    },
    password: {
        type: String,
        required: true
    },
    task: [ 
        { 
            taskItem: String,
            completed: Boolean 
        }
    ]
});

// Authenticate input against db docs
UserSchema.statics.authenticate = (email, password, callback) => {
    UserModel.findOne({ email: email }).exec()
        .then( user => {
            console.log(user);
            if ( !user ) {
                const err = new Error("User not found");
                err.status = 401;
                return callback(err);
            }
            bcrypt.compare(password, user.password, (error, result) => {
                if (error) throw error;
                return callback(null, user);
                
            });
        })
        .catch( err => {
            console.error(err);
        })
}

// Hash password before saving to database
UserSchema.pre('save', function(next) {
    var user = this;    // It's the document saved to mongodb (with _id and all)... The obj we created containing the info the user entered in the form... the data that mongoose will write to mongodb
    bcrypt.hash(user.password, 10, function(err, hash){
        if(err){    // If there's an error pass it to the next function, it will eventually hit the error handler in app.js
            return next(err);   
        }
        user.password = hash; // overwrite the user.password value (a plain text at this point) with the hash (encrypted password)
        next();
    });
});


// Compile model from Schema
const UserModel = mongoose.model('UserModel', UserSchema);

module.exports = UserModel;