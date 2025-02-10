const courseText = document.getElementById("courseValue");
const courses = ["1 КУРС", "2 КУРС", "3 КУРС", "4 КУРС"];
let currentIndex = courses.indexOf(courseText.textContent);

function navigate(direction) {
  currentIndex += direction;
  if (currentIndex < 0) {
    currentIndex = courses.length - 1;
  } else if (currentIndex >= courses.length) {
    currentIndex = 0;
  }
  courseText.textContent = courses[currentIndex];
  courseText.setAttribute("data-course", currentIndex + 1);
  loadSchedule();
}

async function loadSchedule() {
  try {
    const response = await fetch("/api/groups");
    const groups = await response.json();
    const sortedGroups = sortGroups(groups);
    const course = parseInt(courseText.getAttribute("data-course"));
    const scheduleTable = document.getElementById("schedule-table");
    scheduleTable.innerHTML = "";
    scheduleTable.appendChild(generateScheduleTable(sortedGroups, course));
  } catch (error) {
    console.error('Error fetching groups:', error);
  }
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
  const teachersContainer = document.getElementById("teachers-container");
  const scheduleTable = document.getElementById("schedule-table");

  const timeCells = document.querySelectorAll('.time-cell');

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
    Array.prototype.forEach.call(timeCells, cell => {
      cell.classList.remove('selected');
      cell.removeAttribute("data-id");//доробити для обраного часу.
    });
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

// ---------------КОЛОНКИ ВИБОРУ ВІЛЬНОГО ЧАСУ ВИКЛАДАЧА-----------------
function getSelectedColumns() {
  let selectedColumns = [];

  timeCells.forEach(cell => {
    if (cell.classList.contains('selected')) {
      const [_, day, pair] = cell.id.split('-');
      selectedColumns.push({ day: parseInt(day), pair: parseInt(pair) });
    }
  });
  selectedColumns.sort((a, b) => a.day - b.day || a.pair - b.pair);
  return selectedColumns;
}

async function highlightTeacherFreeHours(teacherId) {
  try {
    const response = await fetch(`/api/freehours/teacher/${teacherId}`);
    if (!response.ok) {
      throw new Error("Failed to fetch free hours");
    }
    const freeHours = await response.json();

    freeHours.forEach(freeHour => {
      const cellId = `cell-${freeHour.day}-${freeHour.numberOfPair}`;
      const cell = document.getElementById(cellId);
      if (cell) {
        cell.classList.add('selected');
        cell.setAttribute('data-id', freeHour.id);
      }
    });
    return freeHours;
  } catch (error) {
    console.error("Error highlighting free hours:", error);
    return [];
  }
}

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

// ---------------------- ADD TEACHER --------------------------------

addTeacherForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const formData = new FormData(addTeacherForm);
  const teacherData = {
    fullName: formData.get("teacher-name"),
    position: formData.get("teacher-position")
  };
  const teacherId = addTeacherForm.getAttribute("data-edit-id");

  if (teacherId) {
    teacherData.id = teacherId;
  }
  
  const newFreeHours = getSelectedColumns();
  const teacherDataWithFreeHours = { ...teacherData, freeHours: newFreeHours };

  if (teacherId && JSON.stringify(teacherDataWithFreeHours) === JSON.stringify(initialTeacherData)) {
    showMessage("Дані не змінено!", "error", 2000);
    return;
  }
  if (newFreeHours.length === 0) {
    showMessage("Оберіть вільний час для викладача!", "error", 2000);
    return;
  }

  try {
    let teacher;
    if (!teacherId || (teacherData.fullName !== initialTeacherData.fullName || teacherData.position !== initialTeacherData.position)) {
      const teacherResponse = await fetch(teacherId ? `/api/teachers/${teacherId}` : "/api/teachers", {
        method: teacherId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(teacherData)
      });

      if (!teacherResponse.ok) {
        const errorData = await teacherResponse.json();
        showMessage(errorData.message || "Помилка збереження вчителя!", "error", 2000);
        throw new Error("Server error");
      }

      teacher = await teacherResponse.json();
    } else {
      teacher = teacherData;
    }
    
    // клітинки для додавання та видалення
    const cellsToAdd = [];
    const cellsToDelete = [];

    timeCells.forEach(cell => {
      if (cell.classList.contains('selected') && !cell.hasAttribute('data-id')) {
        cellsToAdd.push(cell);
      } else if (!cell.classList.contains('selected') && cell.hasAttribute('data-id')) {
        cellsToDelete.push(cell);
      }
    });

    // Видаляємо записи
    const deletePromises = cellsToDelete.map(async (cell) => {
      const freeHourId = cell.getAttribute('data-id');
      const response = await fetch(`/api/freehours/${freeHourId}`, {
        method: "DELETE"
      });

      if (!response.ok) {
        const errorData = await response.json();
        showMessage(errorData.message || "Помилка видалення вільного часу!", "error", 2000);
        throw new Error("Server error");
      }
    });

     // Додаємо нові записи
    const addPromises = cellsToAdd.map(async (cell) => {
      const [_, day, pair] = cell.id.split('-');
      const freeHourData = {
        day: parseInt(day),
        numberOfPair: parseInt(pair),
        teacherId: teacher.id
      };

      const response = await fetch("/api/freehours", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(freeHourData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        showMessage(errorData.message || "Помилка збереження вільного часу!", "error", 2000);
        throw new Error("Server error");
      }
    });

    await Promise.all([...deletePromises, ...addPromises]);

    showMessage(teacherId ? "Вчителя успішно оновлено!" : "Вчителя успішно додано!", "success", 2000);
    closeModal();
    loadTeachers();

  } catch (error) {
    console.error("There was a problem with the fetch operation:", error);
  }
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
      loadSchedule();
    } else {
      showMessage("Групу успішно оновлено!", "success", 2000);
      loadGroups();
      loadSchedule();
    }

    closeModal();

  } catch (error) {
    console.error("There was a problem with the fetch operation:", error);
  }
});

document.addEventListener("DOMContentLoaded", (event) => {

  loadGroups();
  loadTeachers();
  loadSchedule();

  groupsContainer.addEventListener('click', (event) => {
    if (event.target.closest('.edit-button')) {
      
      const groupId = event.target.closest('.edit-button').id.replace('edit-group', '');
      openEditGroupModal(groupId);
    } else if (event.target.closest('.delete-button')) {
      
      const groupId = event.target.closest('.delete-button').id.replace('delete-group', '');
      openDeleteGroupModal(groupId);
    }
  });

  teachersContainer.addEventListener('click', (event) => {
    if (event.target.closest('.edit-button')) {
      
      const teacherId = event.target.closest('.edit-button').id.replace('edit-teacher', '');
      openEditTeacherModal(teacherId);
    } else if (event.target.closest('.delete-button')) {
      
      const teacherId = event.target.closest('.delete-button').id.replace('delete-teacher', '');
      openDeleteTeacherModal(teacherId);
    }
  });

  scheduleTable.addEventListener('click', async (event) => {
    const cell = event.target.closest('td[data-group-id]');
    if (cell) {
      const groupId = cell.getAttribute('data-group-id');
      const day = cell.getAttribute('data-day');
      const pair = cell.getAttribute('data-pair');
      //
    }
  });
});

// ---------------------- GROUPS --------------------------------
let initialGroupData = {};

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

async function openEditGroupModal(groupId) {
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
// ---------------------- TEACHERS --------------------------------
let initialTeacherData = {};
async function openEditTeacherModal(teacherId) {
  try {
    const responseTeacher = await fetch(`/api/teachers/${teacherId}`);
    const teacher = await responseTeacher.json();

    openModal();
    addTeacherForm.style.display = "block";
    addTeacherForm.querySelector("legend").textContent = "Редагувати викладача";
    addTeacherForm.querySelector(".submit-button").textContent = "Зберегти";
    addTeacherForm.setAttribute("data-edit-id", teacherId);

    document.getElementById("teacher-name").value = teacher.fullName;
    document.getElementById("teacher-position").value = teacher.position;
    const freeHours = await highlightTeacherFreeHours(teacherId);

    initialTeacherData = {
      fullName: String(teacher.fullName),
      position: String(teacher.position),
      id: String(teacher.id),
      freeHours: freeHours.map(fh => ({ day: fh.day, pair: fh.numberOfPair })).sort((a, b) => a.day - b.day || a.pair - b.pair)
    };

  } catch (error) {
    console.error("Error loading teacher:", error);
  }
}
async function loadTeachers() {
  try {
    const response = await fetch("/api/teachers");
    const teachers = await response.json();
    teachersContainer.innerHTML = "";
    teachers.forEach(teacher => addTeacherToContainer(teacher));
  } catch (error) {
    console.error("Error loading teachers:", error);
  }
}

function addTeacherToContainer(teacher) {
  const teacherItem = document.createElement("div");
  teacherItem.className = "teacher-item";
  teacherItem.innerHTML = `
    <button class="icon-button edit-button" id="edit-teacher${teacher.id}" title="Edit" type="button">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon">
        <path d="M12 20h9"></path>
        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"></path>
      </svg>
    </button>
    <span class="teacher-name">${teacher.fullName}</span>
    <button class="icon-button delete-button" id="delete-teacher${teacher.id}" title="Delete" type="button">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon">
        <path d="M3 6h18"></path>
        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path>
        <path d="M10 11v6"></path>
        <path d="M14 11v6"></path>
        <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"></path>
      </svg>
    </button>
  `;
  teachersContainer.appendChild(teacherItem);
}
// ---------------------- DELETE GROUP AND TEACHER--------------------------------
const deleteModalWindow = document.getElementById("delete-modal-window");
const closeDeleteModalButton = document.getElementById("close-delete-modal");
const confirmDeleteButton = document.getElementById("confirm-delete-button");
const deleteConfirmationText = document.getElementById("delete-confirmation-text");

function openDeleteGroupModal(groupId) {
  deleteModalWindow.setAttribute("data-group-id", groupId);
  deleteConfirmationText.textContent = `Ви впевнені, що хочете видалити групу?`;
  deleteModalWindow.style.display = "block";
  header.classList.add("blur");
  container.classList.add("blur");
  disabledButton();
}

function openDeleteTeacherModal(teacherId) {
  deleteModalWindow.setAttribute("data-teacher-id", teacherId);
  deleteConfirmationText.textContent = `Ви впевнені, що хочете видалити викладача?`;
  deleteModalWindow.style.display = "block";
  header.classList.add("blur");
  container.classList.add("blur");
  disabledButton();
}

function closeDeleteModal() {
  deleteModalWindow.style.display = "none";
  deleteConfirmationText.textContent = "";
  header.classList.remove("blur");
  container.classList.remove("blur");
  enabledButton();
  if (deleteModalWindow.hasAttribute("data-group-id")) {
    deleteModalWindow.removeAttribute("data-group-id");
  } else {
    deleteModalWindow.removeAttribute("data-teacher-id");
  }
}

closeDeleteModalButton.addEventListener("click", closeDeleteModal);

confirmDeleteButton.addEventListener("click", async () => {
  const groupIdToDelete = deleteModalWindow.getAttribute("data-group-id");
  const teacherIdToDelete = deleteModalWindow.getAttribute("data-teacher-id");

  if (!groupIdToDelete && !teacherIdToDelete) return;

  const url = groupIdToDelete ? `/api/groups/${groupIdToDelete}` : `/api/teachers/${teacherIdToDelete}`;
  const entity = groupIdToDelete ? "групи" : "викладача";

  try {
    const response = await fetch(url, {
      method: "DELETE"
    });

    if (!response.ok) {
      const errorData = await response.json();
      showMessage(errorData.message || `Помилка видалення ${entity}!`, "error", 2000);
      throw new Error("Server error");
    }

    showMessage(`${entity.charAt(0).toUpperCase() + entity.slice(1)} успішно видалено!`, "success", 2000);
    if (groupIdToDelete) {
      loadGroups();
      loadSchedule();
    } else {
      loadTeachers();
    }
    closeDeleteModal();

  } catch (error) {
    console.error("There was a problem with the fetch operation:", error);
  }
});

function generateScheduleTable(groups, course) {
  const table = document.createElement("table");
  table.classList.add("schedule-table");
  
  // Заголовки груп
  const theader = document.createElement("thead");
  table.appendChild(theader);
  const headerRow = document.createElement("tr");
  const emptyCell = document.createElement("th");
  emptyCell.colSpan = 2;
  emptyCell.rowSpan = 2;
  headerRow.appendChild(emptyCell);
  
  const filteredGroups = groups.filter(group => group.course === course);
  filteredGroups.forEach(group => {
      const th = document.createElement("th");
      th.textContent = group.name;
      th.colSpan = 1;
      headerRow.appendChild(th);
  });
  theader.appendChild(headerRow);
  
  // Рядок спеціальностей
  const specialtyRow = document.createElement("tr");
  
  let prevSpecialty = "";
  let spanCount = 0;
  filteredGroups.forEach((group, index) => {
      if (group.specialty === prevSpecialty) {
          spanCount++;
      } else {
          if (spanCount > 1) {
              specialtyRow.lastChild.colSpan = spanCount;
          }
          const td = document.createElement("th");
          td.textContent = group.specialty;
          specialtyRow.appendChild(td);
          prevSpecialty = group.specialty;
          spanCount = 1;
      }
  });
  if (spanCount > 1) {
      specialtyRow.lastChild.colSpan = spanCount;
  }
  theader.appendChild(specialtyRow);

  const tbody = document.createElement("tbody");
  table.appendChild(tbody);
  
  // Рядки днів тижня та часу пар
  const days = ["Понеділок", "Вівторок", "Середа", "Четвер", "П'ятниця"];
  const times = [
      "8:40-9:25 9:30-10:15", 
      "10:35-11:20 11:25-12:10", 
      "12:30-13:05 13:10-13:55", 
      "14:05-14:50 14:55-15:40"
  ];
  
  days.forEach(day => {
      const dayRow = document.createElement("tr");
      const dayCell = document.createElement("td");
      dayCell.textContent = day;
      dayCell.classList.add("day");
      dayCell.rowSpan = times.length;
      dayRow.appendChild(dayCell);
      
      times.forEach((time, index) => {
          const timeRow = index === 0 ? dayRow : document.createElement("tr");
          const timeCell = document.createElement("td");
          timeCell.textContent = time;
          timeCell.classList.add("pair-time-cell");
          timeRow.appendChild(timeCell);
          
          filteredGroups.forEach(group => {
              const classCell = document.createElement("td");
              classCell.textContent = "";
              classCell.setAttribute("data-group-id", group.id);
              classCell.setAttribute("data-day", days.indexOf(day) + 1);
              classCell.setAttribute("data-pair", index + 1);

              timeRow.appendChild(classCell);
          });
          
          tbody.appendChild(timeRow);
      });

      if (day !== days[days.length - 1]) {
        const emptyRow = document.createElement("tr");
        const emptyRowCell = document.createElement("td");
        emptyRowCell.colSpan = 2 + filteredGroups.length;
        emptyRow.appendChild(emptyRowCell);
        emptyRowCell.classList.add("empty-row");
        tbody.appendChild(emptyRow);
      }
  });
  
  return table;
}

function sortGroups(groups) {
  return groups.sort((a, b) => {
    if (a.specialty === b.specialty) {
      const numA = parseInt(a.name.match(/\d+/)[0]);
      const numB = parseInt(b.name.match(/\d+/)[0]);
      return numA - numB;
    }
    return a.specialty.localeCompare(b.specialty);
  });
}
