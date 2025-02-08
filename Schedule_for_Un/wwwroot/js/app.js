const courses = ["1 КУРС", "2 КУРС", "3 КУРС", "4 КУРС"];
  let currentIndex = 0;

  function navigate(direction) {
    currentIndex = (currentIndex + direction + courses.length) % courses.length; // Циклічний перехід
    document.getElementById("courseValue").textContent = courses[currentIndex];
  }


  const addGroupsButton = document.getElementById("add-groups");
  const addTeachersButton = document.getElementById("add-teachers");
  const closeModalButton = document.getElementById("close-modal");
  const modalWindow = document.getElementById("modal-window");
  const header = document.querySelector("header");
  const container = document.querySelector(".container");

  const addTeacherForm = document.getElementById("add-teachers-form");
  const addGroupForm = document.getElementById("add-groups-form");
  const groupsContainer = document.getElementById("groups-container");

  let initialGroupData = {};

  function disabledButton() {
    let buttons = document.querySelectorAll("button:not(#modal-window button):not(#delete-modal-window button):not(.delete-button-submit)");
    buttons.forEach(button => {
      button.disabled = true;
    });
  }
  
  function enabledButton() {
    let buttons = document.querySelectorAll("button:not(#modal-window button):not(#delete-modal-window button):not(.delete-button-submit)");
    buttons.forEach(button => {
      button.disabled = false;
    });
  }

function clearForm(form) {
  form.reset();
}

function closeModal() {
  modalWindow.style.display = "none";
  
  if (addTeacherForm.style.display === "block") {
    addTeacherForm.style.display = "none";
    clearForm(addTeacherForm);
    addTeacherForm.removeAttribute("data-edit-id");
  }
  
  if (addGroupForm.style.display === "block") {
    addGroupForm.style.display = "none";
    clearForm(addGroupForm);
    addGroupForm.removeAttribute("data-edit-id");
  }
  
  container.classList.remove("blur");
  header.classList.remove("blur");
  enabledButton();
}
function openModal() {
  modalWindow.style.display = "block";
  header.classList.add("blur");
  container.classList.add("blur");
  disabledButton();
}

function showMessage(text, type, duration) {
  const messageBox = document.getElementById("message-window");
  messageBox.style.display = "block";
  messageBox.textContent = text;
  messageBox.className = `message-window ${type} show`;

  setTimeout(() => {
    messageBox.classList.remove("show");
    setTimeout(() => {
      messageBox.style.display = "none";
      messageBox.textContent = "";
      messageBox.classList.remove(type);
    }, 500);
  }, duration);
}

addGroupsButton.addEventListener("click", () => {
  openModal();
  addGroupForm.style.display = "block";
});

addTeachersButton.addEventListener("click", () => {
  openModal();
  addTeacherForm.style.display = "block";
});

closeModalButton.addEventListener("click", () => {
  if (addTeacherForm.style.display === "block") {
    addTeacherForm.querySelector("legend").textContent = "Додати викладача";
    addTeacherForm.querySelector(".submit-button").textContent = "Додати";
  }
  
  if (addGroupForm.style.display === "block") {
    addGroupForm.querySelector("legend").textContent = "Додати групу";
    addGroupForm.querySelector(".submit-button").textContent = "Додати";
  }
  closeModal();
});

const timeCells = document.querySelectorAll('.time-cell');
timeCells.forEach(cell => {
  cell.addEventListener('click', () => {
    cell.classList.toggle('selected');
  });
});

function toggleCells(selector, index) {
  const cells = document.querySelectorAll(selector);
  const allSelected = Array.from(cells).every(cell => cell.classList.contains('selected'));
  cells.forEach(cell => {
    cell.classList.toggle('selected', !allSelected);
  });
}

document.querySelectorAll('.day-header').forEach(header => {
  header.addEventListener('click', () => {
    toggleCells(`tbody tr td:nth-child(${parseInt(header.dataset.day) + 1})`);
  });
});

document.querySelectorAll('.pair-header').forEach(header => {
  header.addEventListener('click', () => {
    toggleCells(`tbody tr:nth-child(${header.dataset.pair}) td`);
  });
});

addGroupForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const formData = new FormData(addGroupForm);
  const groupData = {
    name: formData.get("group-name"),
    course: formData.get("group-course"),
    specialty: formData.get("group-specialty")
  };
  
  const groupId = addGroupForm.getAttribute("data-edit-id");
  if (groupId) {
    groupData.id = groupId;
  }

  if (groupId && JSON.stringify(groupData) === JSON.stringify(initialGroupData)) {
    showMessage("Дані не змінено!", "error", 2000);
    return;
  }
  const method = groupId ? "PUT" : "POST";
  const url = groupId ? `/api/groups/${groupId}` : "/api/groups";

  try {
    const response = await fetch(url, {
      method: method,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(groupData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      showMessage(errorData.message || "Помилка додавання групи!", "error", 2000);
      throw new Error("Server error");
    }

    if (method === "POST") {
      const newGroup = await response.json();
      addGroupToContainer(newGroup);
      showMessage("Групу успішно додано!", "success", 2000);
    } else {
      showMessage("Групу успішно оновлено!", "success", 2000);
      loadGroups();
    }

    closeModal();

  } catch (error) {
    console.error("There was a problem with the fetch operation:", error);
  }
});

async function openEditModal(groupId) {
  try {
    const response = await fetch(`/api/groups/${groupId}`);
    const group = await response.json();

    openModal();
    addGroupForm.style.display = "block";
    addGroupForm.querySelector("legend").textContent = "Редагувати групу";
    addGroupForm.querySelector(".submit-button").textContent = "Зберегти";
    addGroupForm.setAttribute("data-edit-id", groupId);

    document.getElementById("group-name").value = group.name;
    document.getElementById("group-course").value = group.course;
    document.getElementById("group-specialty").value = group.specialty;

    initialGroupData = {
      name: String(group.name),
      course: String(group.course),
      specialty: String(group.specialty),
      id: String(group.id) //використовуємо для порівняння, спеціально вкінці, бо === не буде працювати
    };

  } catch (error) {
    console.error("Error loading group:", error);
  }
}

document.addEventListener("DOMContentLoaded", (event) => {

  loadGroups();

  groupsContainer.addEventListener('click', (event) => {
    if (event.target.closest('.edit-button')) {
      
      const groupId = event.target.closest('.edit-button').id.replace('edit-group', '');
      openEditModal(groupId);
    } else if (event.target.closest('.delete-button')) {
      
      const groupId = event.target.closest('.delete-button').id.replace('delete-group', '');
      openDeleteModal(groupId);
    }
  });
});

async function loadGroups() {
  try {
    const response = await fetch("/api/groups");
    const groups = await response.json();
    groupsContainer.innerHTML = "";
    groups.forEach(group => addGroupToContainer(group));
  } catch (error) {
    console.error("Error loading groups:", error);
  }
}
function addGroupToContainer(group) {
  const groupItem = document.createElement("div");
  groupItem.className = "group-item";
  groupItem.innerHTML = `
    <button class="icon-button edit-button" id="edit-group${group.id}" title="Edit" type="button">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon">
        <path d="M12 20h9"></path>
        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"></path>
      </svg>
    </button>
    <span class="group-name">${group.name}</span>
    <button class="icon-button delete-button" id="delete-group${group.id}" title="Delete" type="button">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon">
        <path d="M3 6h18"></path>
        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path>
        <path d="M10 11v6"></path>
        <path d="M14 11v6"></path>
        <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"></path>
      </svg>
    </button>
  `;
  groupsContainer.appendChild(groupItem);

}
// ---------------------- DELETE GROUP --------------------------------
const deleteModalWindow = document.getElementById("delete-modal-window");
const closeDeleteModalButton = document.getElementById("close-delete-modal");
const confirmDeleteButton = document.getElementById("confirm-delete-button");

let groupIdToDelete = null;

function openDeleteModal(groupId) {
  groupIdToDelete = groupId;
  deleteModalWindow.style.display = "block";
  header.classList.add("blur");
  container.classList.add("blur");
  disabledButton();
}

function closeDeleteModal() {
  deleteModalWindow.style.display = "none";
  header.classList.remove("blur");
  container.classList.remove("blur");
  enabledButton();
  groupIdToDelete = null;
}

closeDeleteModalButton.addEventListener("click", closeDeleteModal);

confirmDeleteButton.addEventListener("click", async () => {
  if (!groupIdToDelete) return;

  try {
    const response = await fetch(`/api/groups/${groupIdToDelete}`, {
      method: "DELETE"
    });

    if (!response.ok) {
      const errorData = await response.json();
      showMessage(errorData.message || "Помилка видалення групи!", "error", 2000);
      throw new Error("Server error");
    }

    showMessage("Групу успішно видалено!", "success", 2000);
    loadGroups();
    closeDeleteModal();

  } catch (error) {
    console.error("There was a problem with the fetch operation:", error);
  }
});