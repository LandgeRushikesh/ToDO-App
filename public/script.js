async function updateTaskCompletion(taskId, isCompleted) {
  try {
    const taskDiv = document.querySelector(`[data-id="${taskId}"]`);
    const taskName = taskDiv.querySelector(".taskName").textContent; // Get the task name

    const response = await fetch(`http://localhost:3001/tasks/${taskId}`, {
      method: "PUT", // Use PUT for full update
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ completed: isCompleted, name: taskName }), // Send the updated completion status and name
    });

    const result = await response.json();

    if (response.ok) {
      console.log("Task updated successfully:", result.task);
    } else {
      console.error("Error updating task:", result.message);
    }
  } catch (err) {
    console.error("Error:", err.message);
  }
}

function attachCheckboxListeners() {
  let complete = document.querySelectorAll(".complete");

  complete.forEach((checkbox) => {
    checkbox.addEventListener("change", async (e) => {
      const taskDiv = e.target.closest(".task");
      const taskId = taskDiv.getAttribute("data-id"); // Get the task ID
      const isChecked = e.target.checked; // Get the checkbox state

      // Update the task completion status in the database
      await updateTaskCompletion(taskId, isChecked);

      // Toggle the strikethrough effect on the task name
      const taskName = taskDiv.querySelector(".taskName");
      if (isChecked) {
        taskName.classList.add("line-through");
      } else {
        taskName.classList.remove("line-through");
      }
    });
  });
}

function attachDeleteListeners() {
  const deleteButtons = document.querySelectorAll(".delete");

  deleteButtons.forEach((button) => {
    button.addEventListener("click", async (e) => {
      const taskDiv = e.target.closest(".task");
      const taskId = taskDiv.getAttribute("data-id");

      const isTaskCompleted = taskDiv.querySelector("input.complete").checked;
      
      if (!isTaskCompleted) {
        alert(`You cannot delete the incomplete task:`);
        return;  // Stop execution if task is incomplete
      }

      try {
        const response = await fetch(`http://localhost:3001/tasks/${taskId}`, {
          method: "DELETE",
        });

        const result = await response.json();

        if (response.ok) {
          // Remove the task from the UI
          taskDiv.remove();
          alert("Task removed successfully!!!");
        } else {
          alert(`Error: ${result.message}`);
        }
      } catch (err) {
        alert(`Error: ${err.message}`);
      }
    });
  });
}

async function fetchTasks() {
  try {
    const response = await fetch("http://localhost:3001/tasks"); // Send GET request to fetch tasks

    const result = await response.json();

    if (response.ok) {
      const tasks = result.tasks;
      const taskList = document.querySelector(".task-list");

      // Clear current tasks in the UI
      taskList.innerHTML = "<h2>Tasks:</h2>";

      // Create the HTML for all tasks using a template literal
      tasks.forEach((task) => {
        taskList.innerHTML += `
            <div class="task" data-id="${task._id}">
              <input type="checkbox" class="complete" ${
                task.completed ? "checked" : ""
              }>
              <p class="taskName ${task.completed ? 'line-through' : ''}">${task.Task}</p>
              <button class="delete"><i class="fa-solid fa-trash"></i></button>
            </div>
          `;
      });

      // Re-attach checkbox listeners after adding tasks to UI
      attachCheckboxListeners();

      attachDeleteListeners();
    } else {
      alert(`Error: ${result.message}`);
    }
  } catch (err) {
    console.error("Error fetching tasks:", err);
    alert("Failed to fetch tasks.");
  }
}

let inputForm = document.querySelector(".input");
let taskInput = document.querySelector("#ip-field");

inputForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  let taskName = taskInput.value.trim();

  if (taskName) {
    try {
      const response = await fetch("http://localhost:3001/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: taskName, completed: false }),
      });

      const result = await response.json();

      if (response.ok) {
        // Success message
        alert("Task added successfully!");
        taskInput.value = ""; // Clear input field

        // Fetch tasks again to display the updated list
        fetchTasks();
      } else {
        alert(`Error: ${result.message}`);
      }
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  } else {
    // Empty input
    alert("Please enter a task.");
  }
});

// Call the function when the page loads to display tasks
window.addEventListener("DOMContentLoaded", fetchTasks);
