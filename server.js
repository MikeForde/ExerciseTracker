const express = require('express')
const app = express()
const bodyParser = require('body-parser')

const cors = require('cors')

const mongoose = require('mongoose')
var user = require('./user')
var exercise = require('./exercise')

mongoose.connect(process.env.MLAB_URI || 'mongodb://localhost/exercise-track' )

app.use(cors())

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())


app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.post('/api/exercise/new-user', (req, res, next) => {
  //res.send("Will add new user called " + req.body.username);
  var u = new user()
  let username = req.body.username
  u.name = username
  u.save(function (err, user) {
      if (err) {
          return next(err)
      }
      res.send({ "username": user.name, "user_id" : user._id})
  })
});

app.post('/api/exercise/add', (req, res, next) => {
  // first check if user is in database
  user.findById(req.body.userId, function (err) {
      if (err) return next(err)
      // res.send("done")
      var e = new exercise()
      let desc = req.body.description
      let uId = req.body.userId
      let dur = req.body.duration
      let dat = req.body.date
      e.uId = uId
      e.desc = desc
      e.dur = dur
      e.dat = dat
      e.save(function (err, exercise) {
          if (err) {
              return next(err)
          }
          res.send({ "descrition": exercise.desc, "exercise_id" : exercise._id})
      })
    })
});

app.get('/api/exercise/users', (req, res, next) => {
  //res.send("get users")
  user.find({}, function(err, users) {
    if (err) return next(err)
    res.send(users)
  })
});

app.get('/api/exercise/log', (req, res, next) => {
  if(!req.query.userId){
    res.send("Sorry, no id given")
  }
  user.findById(req.query.userId, function (err, users) {
      if (err) return next(err)
      // res.send("done")
      var userId = req.query.userId
      var from = req.query.from ? req.query.from : null
      var to = req.query.to ? req.query.to : null
      var limit = req.query.limit ? parseInt(req.query.limit) : null
      // build query
      var query = {uId: userId}
      if(from) {
        query.dat = {$gte: new Date(from)}
        if(to) {query.dat.$lt = new Date(to)}
      } else if (to) {
        query.dat = {$lt: new Date(from)}
      }
      //res.send(query)
      var q = exercise.find(query)
      if(limit){q.limit(limit)}
      
      q.exec((err, exercises) => {
        if(err) return next(err)
        res.send({ "_id" : users._id, "username": users.name , "count": exercises.length, "log" : exercises})
      })
    })
});


// Not found middleware
app.use((req, res, next) => {
  return next({status: 404, message: 'not found'})
})

// Error Handling middleware
app.use((err, req, res, next) => {
  let errCode, errMessage

  if (err.errors) {
    // mongoose validation error
    errCode = 400 // bad request
    const keys = Object.keys(err.errors)
    // report the first validation error
    errMessage = err.errors[keys[0]].message
  } else {
    // generic or custom error
    errCode = err.status || 500
    errMessage = err.message || 'Internal Server Error'
  }
  res.status(errCode).type('txt')
    .send(errMessage)
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
