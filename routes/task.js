const express = require('express');
const router = express.Router();
const { isLoggedIn } = require('../middleware');
const User = require('../models/user');
const ToDoList = require('../models/toDoList');
const Task = require('../models/task');

//Creating a list
router.post('/lists/create', isLoggedIn, async (req, res, next) => {
  //64db6991c72f8b4df08af6bb
  try {
    const userId = req.user.userId;
    const { listName } = req.body;
    const user = await User.findById(userId);
    if (!user) return next({ status: 404, message: 'User not found' });

    const toDoList = new ToDoList({
      user: user._id,
      listName: listName,
    });
    const newToDoList = await toDoList.save();

    return res.status(200).json(newToDoList);
  } catch (err) {
    return next({ status: 400, message: 'Cannot create a list' });
  }
});

//CREATING A TASK
router.post('/lists/:listId/tasks', isLoggedIn, async (req, res, next) => {
  try {
    const { listId } = req.params;
    const { title, description, dueDate, priority, status } = req.body;

    const toDoList = await ToDoList.findById(listId);
    if (!toDoList) return next({ status: 404, message: 'List not found' });

    const task = new Task({
      list: listId,
      title,
      description,
      priority,
      status,
    });

    const newTask = await task.save();

    return res
      .status(200)
      .json({ message: 'successfully created a new task', newTask });
  } catch (err) {
    console.log(err);
    return next({ status: 400, message: err });
  }
});

//UPDATING A LIST ---->>>
router.patch('/lists/:listId/edit', async (req, res, next) => {
  try {
    const { listId } = req.params;
    const { listName } = req.body;
    const list = await ToDoList.findById(listId);
    if (!list) return next({ status: 404, message: 'List not found' });

    const newList = await ToDoList.findByIdAndUpdate(
      listId,
      { listName },
      { new: true }
    );
    newList.updatedAt = Date.now();
    await newList.save();
    console.log(newList);

    res.status(200).json({ message: 'Successfully updated list' });
  } catch (err) {
    console.log(err);
    return next({ message: err });
  }
});

//UPDATING A TASK --->>>
router.patch('/lists/:listId/tasks/:taskId/edit', async (req, res, next) => {
  //listId = 64e4b218fbd7d0ecc8ba6ddc
  //taskId = 64e4b28593b79927135acc6a
  try {
    const { listId, taskId } = req.params;
    const newTask = req.body;

    const list = await ToDoList.findById(listId);
    if (!list) return next({ status: 404, message: 'List not found' });

    const task = await Task.findById(taskId).populate('list').exec();
    if (!task) return next({ status: 404, message: 'Task not found' });

    const updatedTask = await Task.findByIdAndUpdate(taskId, newTask, {
      new: true,
    });

    console.log(updatedTask);

    res.status(200).json({ message: 'Task successfully updated', updatedTask });
  } catch (err) {
    return next({ status: 400, message: 'Error updating the task' });
  }
});

//DELETING A LIST
router.delete('/lists/:listId/delete', async (req, res, next) => {
  try {
    const { listId } = req.params;
    const list = await ToDoList.findById(listId);
    if (!list) return next({ status: 404, message: 'List not found' });
    const deletedList = await ToDoList.findByIdAndDelete(listId);
    res
      .status(200)
      .json({ message: `Successfully Deleted ${deletedList.listName}` });
  } catch (err) {
    return next({ status: 404, message: 'Error deleting a list' });
  }
});

//DELETING A TASK ---->
router.delete('/lists/:listId/tasks/:taskId/delete', async (req, res, next) => {
  try {
    const { listId, taskId } = req.params;

    const list = await ToDoList.findById(listId);
    if (!list) return next({ status: 404, message: 'List not found' });

    const task = await Task.findById(taskId);
    if (!task) return next({ status: 404, message: 'Task not found' });

    const deletedTask = await Task.findByIdAndDelete(taskId);
    console.log(deletedTask);
    res.status(200).json({
      message: `Successfully deleted ${deletedTask.title}`,
      deletedTask,
    });
  } catch (err) {
    return next({ status: 400, message: 'Task cannot be deleted', err});
  }
});

//Marking a task as complete
router.post('/completed', async (req, res, next) => {
  try {
    const { taskId } = req.body;
    const task = await Task.findById(taskId);
    if (!task) return next({ status: 404, message: 'Task not found' });
    task.status = 'Completed';
    await task.save();
    res.status(200).json({ message: `Task status: ${task.status}` });
  } catch (err) {
    return next({ status: 400, message: 'Task cannot be mark as completed' });
  }
});

router.post('/pending', async (req, res, next) => {
  try {
    const { taskId } = req.body;
    const task = await Task.findById(taskId);
    if (!task) return next({ status: 404, message: 'Task not found' });
    task.status = 'Pending';
    await task.save();
    res.status(200).json({ message: `Task status: ${task.status}` });
  } catch (err) {
    return next({ status: 400, message: 'Task cannot be mark as pending' });
  }
});

//APPLY SANITIZATION OF HTML USING (sanitize-html/validator)

module.exports = router;
