const mongoose = require('mongoose');
const {Schema} = mongoose;
const Task = require('./task');

const toDoListSchema = new Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    listName: { type: String},
    createdAt: { type: Date, default: Date.now },
    updatedAt : {type: Date}
  });

toDoListSchema.post('findOneAndDelete', async function(doc) {
    if(doc){
        const listId = doc["_id"]
        await Task.deleteMany({list: listId})
    }
})

module.exports = mongoose.model('ToDoList', toDoListSchema);