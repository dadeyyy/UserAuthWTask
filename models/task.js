const mongoose = require('mongoose');
const {Schema } = mongoose;

const taskSchema = new Schema({
    list: {type: Schema.Types.ObjectId, ref: 'ToDoList'},
    title: String,
    description: String,
    dueDate: {type: Date},
    priority: { type: Number},
    status: {type: String, enum:['Pending', 'Completed']},
    createdAt : {type: Date, default: Date.now},
    updatedAt: {type: Date}
})

module.exports = mongoose.model('Task', taskSchema)