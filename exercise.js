var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ExerciseSchema = new Schema({
    uId: String,
    desc: String,
    dur: Number,
    dat: Date
});
module.exports = mongoose.model('Exercise', ExerciseSchema);