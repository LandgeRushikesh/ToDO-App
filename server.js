const express = require("express")
const mongoose = require("mongoose")
const path = require('path');
const bodyParser = require("body-parser")

const app = express()
app.use(bodyParser.json())

app.use(express.static(path.join( __dirname,"public")))

const port = 3001

const Task = require("./models/tasks")

// MongoDB connection 
mongoose.connect('mongodb://localhost:27017/todoList')
    .then(()=>{console.log("Connected to MongoDB")})
    .catch((err)=>{console.log("Error Connecting MongoDB",err)})

// testing the route
app.get('/',(req,res)=>{
    res.send("Welcome to ToDo List app")
})

// adding task to DB
app.post("/tasks", async (req, res) => {
    try {
      const newTask = new Task({
        Task: req.body.name,
        completed: req.body.completed || false,
      });
      await newTask.save();
      res.status(201).json({ message: "Task added successfully", task: newTask });
    } catch (err) {
      res.status(500).json({ message: "Failed to add task", error: err.message });
    }
});

// Fetch all tasks from the database
app.get("/tasks", async (req, res) => {
    try {
      const tasks = await Task.find();  // Find all tasks in the database
      res.status(200).json({ tasks: tasks });
    } catch (err) {
      console.error("Error fetching tasks:", err);
      res.status(500).json({ message: "Failed to fetch tasks", error: err.message });
    }
});

app.delete("/tasks/:id", async (req, res) => {
    try {
      const taskId = req.params.id;
      const deletedTask = await Task.findByIdAndDelete(taskId);
  
      if (!deletedTask) {
        return res.status(404).json({ message: "Task not found" });
      }
  
      res.status(200).json({ message: "Task deleted successfully" });
    } catch (err) {
      res.status(500).json({ message: "Failed to delete task", error: err.message });
    }
  })

// Updating the completion status of a task using PUT
app.put("/tasks/:id", async (req, res) => {
    const taskId = req.params.id;
    const { completed, name } = req.body;  // The completed status and name sent from the frontend
  
    try {
      const updatedTask = await Task.findByIdAndUpdate(
        taskId,
        { completed, name },  // Update the completed and name fields
        { new: true }    // Return the updated document
      );
  
      if (!updatedTask) {
        return res.status(404).json({ message: "Task not found" });
      }
  
      res.status(200).json({ message: "Task updated successfully", task: updatedTask });
    } catch (err) {
      res.status(500).json({ message: "Failed to update task", error: err.message });
    }
  });



// Starting the server
app.listen(port,()=>{
    console.log(`App is running on port ${port}`)
})