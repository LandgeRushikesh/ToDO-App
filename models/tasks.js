const mongoose = require("mongoose")

const taskSchema = new mongoose.Schema({
    Task : {type:String,require:true},
    completed : {type:Boolean,default:false}
})

module.exports = mongoose.model("Task",taskSchema)