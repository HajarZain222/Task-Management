addEventListener("load", () => {

  // Main Selectors
  const taskInputField = document.querySelector(".task-input-field");
  const addTaskButton = document.getElementById("addTaskBtn");
  const leftZone = document.querySelector(".left-zone");

  // Team setup popup
  Swal.fire({
    confirmButtonText: "Create Board",

    customClass: {
      confirmButton: "popUp-btn",
      popup: "my-popup",
    },

    html: `
        <h3 class="popUp-title">👥 Set Up Your Team</h3>
        <label class="popUp-label">Enter team member names separated by commas: </label>
        <input type="text" id="teamMembers" class="swal2-input popUp-input" placeholder="e.g.. Hajar, Sohaila, Fatima, Shorok">
    `,

    // Validate popup input
    preConfirm: () => {
      const value = document.getElementById("teamMembers").value.trim();

      if (!value) {
        Swal.showValidationMessage("Please enter at least one team member name");
        return false;
      }

      return { teamMembers: value };
    },
  }).then((result) => {
    if (!result.isConfirmed) return;

    const teamMembersString = result.value.teamMembers;

    // Convert names string → array
    const teamMembersArray = teamMembersString
      .split(",")
      .map((name) => name.trim())
      .filter((name) => name);

    const tasksColumns = document.querySelector(".tasks-columns");

    // Create member columns
    teamMembersArray.forEach((member) => {
      const column = document.createElement("div");
      column.classList.add("column");

      column.innerHTML = `
        <div class="column-header member">
            🗣️ ${member}
            <span class="tasksCount">0</span>
        </div>

        <div class="task-List-container">
            <div class="tasks-list drop-zone">
                <p class="empty-tasks">No Tasks Assigned</p>
            </div>
        </div>
    `;

      tasksColumns.appendChild(column);
    });

    const allDropZones = document.querySelectorAll(".drop-zone");

    // Drag & Drop behavior
    allDropZones.forEach((zone) => {
      zone.addEventListener("dragenter", function (e) {
        e.preventDefault();
        this.classList.add("zone-active");
      });

      zone.addEventListener("dragover", (e) => e.preventDefault());

      zone.addEventListener("dragleave", function () {
        this.classList.remove("zone-active");
      });

      zone.addEventListener("drop", function (e) {
        e.preventDefault();
        this.classList.remove("zone-active");

        const taskId = e.dataTransfer.getData("taskId");
        const taskElement = document.getElementById(taskId);

        this.appendChild(taskElement);

        // Add status select only once
        if (!taskElement.querySelector(".status-select")) {
          addStatusToTask(taskElement);
        }

        updateAllCounts();
      });
    });
  });

  // Add new task
  addTaskButton.addEventListener("click", () => {
    const taskValue = taskInputField.value.trim();
    if (taskValue === "") return;

    const taskItem = document.createElement("div");
    taskItem.className = "task-item notSelect";

    // Generate unique id
    const currentCount = document.querySelectorAll(".task-item").length;
    taskItem.id = `task${currentCount + 1}`;
    taskItem.draggable = true;

    // Drag start logic
    taskItem.addEventListener("dragstart", function (e) {
      const parentZone = this.closest(".tasks-list");

      if (parentZone && parentZone.classList.contains("left-zone")) {
        leftZone.classList.remove("zone-active");
      }

      this.style.opacity = "0.4";
      e.dataTransfer.setData("taskId", e.target.id);
    });

    // Drag end reset
    taskItem.addEventListener("dragend", function () {
      leftZone.classList.remove("zone-active");
      this.style.opacity = "1";
    });

    // Task header (title + delete)
    const taskHeader = document.createElement("div");
    taskHeader.classList.add("task-header");

    const taskContent = document.createElement("p");
    taskContent.className = "task-text";
    taskContent.innerText = taskValue;

    const deleteTaskButton = document.createElement("button");
    deleteTaskButton.classList.add("del-task-btn");
    deleteTaskButton.innerText = "x";

    taskHeader.appendChild(taskContent);
    taskHeader.appendChild(deleteTaskButton);
    taskItem.appendChild(taskHeader);

    leftZone.appendChild(taskItem);

    // Delete task
    deleteTaskButton.addEventListener("click", () => {
      taskItem.remove();
      updateAllCounts();
    });

    updateAllCounts();
    taskInputField.value = "";
  });

  // Update tasks count per column
  function updateAllCounts() {
    const columns = document.querySelectorAll(".column");

    columns.forEach((column) => {
      const tasksList = column.querySelector(".tasks-list");
      const countSpan = column.querySelector(".tasksCount");
      const emptyMsg = column.querySelector(".empty-tasks");

      const tasks = tasksList.querySelectorAll(".task-item").length;

      countSpan.innerText = tasks;
      emptyMsg.style.display = tasks === 0 ? "block" : "none";
    });
  }

  // Add status dropdown to task
  function addStatusToTask(task) {
    const selectDiv = document.createElement("div");
    selectDiv.className = "select-div";

    const select = document.createElement("select");
    select.className = "status-select";

    select.innerHTML = `
    <option value="notSelect" selected>Not Selected</option>
    <option value="onGoing">On Going</option>
    <option value="finished">Finished</option>
  `;

    selectDiv.appendChild(select);
    task.appendChild(selectDiv);

    // Change task color based on status
    select.addEventListener("change", () => {
      task.classList.remove("notSelect", "onGoing", "finished");
      task.classList.add(select.value);
    });
  }
});