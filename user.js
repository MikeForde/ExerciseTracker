var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var UserSchema = new Schema({
    name: String,
    id: Number
});
module.exports = mongoose.model('User', UserSchema);