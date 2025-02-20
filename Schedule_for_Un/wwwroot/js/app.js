const courseText = document.getElementById("courseValue");
const courses = ["1 КУРС", "2 КУРС", "3 КУРС", "4 КУРС"];
let currentIndex = courses.indexOf(courseText.textContent);

let isEvenWeek = true; // для розкладу

function toggleWeek() {
  isEvenWeek = !isEvenWeek;
  loadSchedule();
}

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

document.getElementById("search-input-groups").addEventListener("input", function () {
  const searchValue = this.value.toLowerCase();
  const groupsContainer = document.getElementById("groups-container");
  const groupItems = Array.from(groupsContainer.children);

  if (searchValue === "") {
    loadGroups();
    return;
  }

  groupItems.sort((a, b) => {
      const nameA = a.querySelector(".group-name").textContent.toLowerCase();
      const nameB = b.querySelector(".group-name").textContent.toLowerCase();

      const matchA = nameA.includes(searchValue);
      const matchB = nameB.includes(searchValue);

      return matchB - matchA; // Якщо matchB > matchA, то B підніметься вище
  });

  groupItems.forEach(item => {
    groupsContainer.appendChild(item);
    const groupName = item.querySelector(".group-name");
        if (groupName.textContent.toLowerCase().includes(searchValue)) {
            item.classList.add("highlight"); 
        } else {
            item.classList.remove("highlight");
        }
  });
});

document.getElementById("search-input-teachers").addEventListener("input", function () {
  const searchValue = this.value.toLowerCase();
  const teachersContainer = document.getElementById("teachers-container");
  const teacherItems = Array.from(teachersContainer.children);

  if (searchValue === "") {
    loadTeachers();
    return;
  }

  teacherItems.sort((a, b) => {
    const nameA = a.querySelector(".teacher-name").textContent.toLowerCase();
    const nameB = b.querySelector(".teacher-name").textContent.toLowerCase();

    const matchA = nameA.includes(searchValue);
    const matchB = nameB.includes(searchValue);

    return matchB - matchA;
  });

  teacherItems.forEach(item => {
    teachersContainer.appendChild(item);
    const teacherName = item.querySelector(".teacher-name");
    if (teacherName.textContent.toLowerCase().includes(searchValue)) {
      item.classList.add("highlight");
    } else {
      item.classList.remove("highlight");
    }
  });
});



async function loadSchedule() {
  try {
    const response = await fetch("/api/groups");
    const groups = await response.json();
    const sortedGroups = sortGroups(groups);
    const course = parseInt(courseText.getAttribute("data-course"));
    let lessons = [];

    const responseLessons = await fetch(`/api/lessons/lesson-course/${course}`);
    if (responseLessons.ok) {
      lessons = await responseLessons.json();
    }

    const scheduleTable = document.getElementById("schedule-table");
    scheduleTable.innerHTML = "";
    scheduleTable.appendChild(generateScheduleTable(sortedGroups, course, lessons));
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
    let buttons = document.querySelectorAll("button:not(#modal-window button):not(#delete-modal-window button)");
    buttons.forEach(button => {
      button.disabled = true;
    });
  }
  
  function enabledButton() {
    let buttons = document.querySelectorAll("button:not(#modal-window button):not(#delete-modal-window button)");
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
      cell.classList.remove('not-free');
      cell.removeAttribute("data-id");
      cell.innerHTML = "";
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
    const data = await response.json();
    const AvailableHours = data.availableHours;
    const OccupiedHours = data.occupiedHours;

    AvailableHours.forEach(freeHour => {
      const cellId = `cell-${freeHour.day}-${freeHour.numberOfPair}`;
      const cell = document.getElementById(cellId);
      if (cell) {
        cell.classList.add('selected');
        cell.setAttribute('data-id', freeHour.id);
      }
    });

    for (const occupiedHour of OccupiedHours) {
      const cellId = `cell-${occupiedHour.day}-${occupiedHour.numberOfPair}`;
      const cell = document.getElementById(cellId);
      if (cell) {
        cell.classList.add('not-free');
        const lessonResponse = await fetch(`/api/lessons/${occupiedHour.lessonId}`);
        if (lessonResponse.ok) {
          const lesson = await lessonResponse.json();
          const groupNames = await Promise.all(
            lesson.groupLessons.map(async (groupLesson) => {
              const groupResponse = await fetch(`/api/groups/${groupLesson.groupId}`);
              if (groupResponse.ok) {
                const group = await groupResponse.json();
                return group.name;
              }
              return null;
            })
          );
            cell.innerHTML = `<p><b>${lesson.subject} (${lesson.isLecture ? 'Л' : 'П'})</b></p><p>${groupNames.filter(name => name).join(', ')}</p>`;
        }
      }
    }

    return AvailableHours;
  } catch (error) {
    console.error("Error highlighting free hours:", error);
    return [];
  }
}

timeCells.forEach(cell => {
  cell.addEventListener('click', () => {
    if (!cell.classList.contains('not-free')) {
      cell.classList.toggle('selected');
    }
  });
});

function toggleCells(selector, index) {
  const cells = document.querySelectorAll(selector);
  const allSelected = Array.from(cells).every(cell => cell.classList.contains('selected') || cell.classList.contains('not-free'));
  cells.forEach(cell => {
    if (!cell.classList.contains('not-free')) {
      cell.classList.toggle('selected', !allSelected);
    }
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
        showMessage(errorData.message || "Помилка збереження викладача!", "error", 2000);
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

    showMessage(teacherId ? "Викладача успішно оновлено!" : "Викладача успішно додано!", "success", 2000);
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
    if (cell && (modalWindow.style.display === "none" && deleteModalWindow.style.display === "none")) {
      const groupId = cell.getAttribute('data-group-id');
      const day = cell.getAttribute('data-day');
      const pair = cell.getAttribute('data-pair');

      try {
        let teacher = await CheckFreeTeacher(day, pair);
        let groups = await CheckSimilarGroup(groupId, day, pair);
        if(teacher === false)
        {
          showMessage("Немає вільних викладачів на цей день та час", "error", 4000);
          return;
        }
        if(groups === false)
        {
          showMessage("Помилка вибору групи", "error", 4000);
          return;
        }
        customModal.style.display = 'block';
        openAddLessonModal(groupId, day, pair);
        populateTeacherSelect(teacher);
        populateGroupSelectBySpecialtyAndCourse(groups, groupId);
      }
      catch (error) {
        console.error("Error populating teacher select:", error);
      }
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
    const AvailableHours = await highlightTeacherFreeHours(teacherId);

    initialTeacherData = {
      fullName: String(teacher.fullName),
      position: String(teacher.position),
      id: String(teacher.id),
      freeHours: AvailableHours.map(fh => ({ day: fh.day, pair: fh.numberOfPair })).sort((a, b) => a.day - b.day || a.pair - b.pair)
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
    <span class="teacher-name">${teacher.fullName} <span style="color: gray; text-transform: lowercase; padding-left: 5px;">(${teacher.position})</span></span>
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

function openDeleteLessonModal(lessonId) {
  deleteModalWindow.setAttribute("data-lesson-id", lessonId);
  deleteConfirmationText.textContent = `Ви впевнені, що хочете видалити заняття?`;
  deleteModalWindow.style.display = "block";
  header.classList.add("blur");
  container.classList.add("blur");
  disabledButton();
}

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
  deleteModalWindow.removeAttribute("data-group-id");
  deleteModalWindow.removeAttribute("data-teacher-id");
  deleteModalWindow.removeAttribute("data-lesson-id");
}

closeDeleteModalButton.addEventListener("click", closeDeleteModal);

confirmDeleteButton.addEventListener("click", async () => {
  const groupIdToDelete = deleteModalWindow.getAttribute("data-group-id");
  const teacherIdToDelete = deleteModalWindow.getAttribute("data-teacher-id");
  const lessonIdToDelete = deleteModalWindow.getAttribute("data-lesson-id");

  if (!groupIdToDelete && !teacherIdToDelete && !lessonIdToDelete) return;

  const url = lessonIdToDelete ? `/api/lessons/${lessonIdToDelete}` : groupIdToDelete ? `/api/groups/${groupIdToDelete}` : `/api/teachers/${teacherIdToDelete}`;
  const entity = lessonIdToDelete ? "заняття" : groupIdToDelete ? "групи" : "викладача";

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
    } else if (teacherIdToDelete) {
      loadTeachers();
    } else if (lessonIdToDelete) {
      loadSchedule();
    }
    closeDeleteModal();

  } catch (error) {
    console.error("There was a problem with the fetch operation:", error);
  }
});

function generateScheduleTable(groups, course, lessons) {
  const table = document.createElement("table");
  table.classList.add("schedule-table");
  
  // Заголовки груп
  const theader = document.createElement("thead");
  table.appendChild(theader);
  const headerRow = document.createElement("tr");
  const emptyCell = document.createElement("th");
  emptyCell.colSpan = 2;
  emptyCell.rowSpan = 2;
  emptyCell.classList.add("nav-cell");
  emptyCell.innerHTML = isEvenWeek ? `Парний` : `Непарний`; // Відображення стану тижня
  emptyCell.addEventListener("click", toggleWeek);
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
      "12:20-13:05 13:10-13:55", 
      "14:05-14:50 14:55-15:40"
  ];
  
  for (let dayIndex = 0; dayIndex < days.length; dayIndex++) {
    const day = days[dayIndex];
    for (let timeIndex = 0; timeIndex < times.length; timeIndex++) {
      const time = times[timeIndex];
      const timeRow = document.createElement("tr");

      if (timeIndex === 0) {
        const dayCell = document.createElement("td");
        dayCell.textContent = day;
        dayCell.classList.add("day");
        dayCell.rowSpan = times.length;
        timeRow.appendChild(dayCell);
      }

      const timeCell = document.createElement("td");
      timeCell.textContent = time;
      timeCell.classList.add("pair-time-cell");
      timeRow.appendChild(timeCell);

      for (let groupIndex = 0; groupIndex < filteredGroups.length; groupIndex++) {
        const group = filteredGroups[groupIndex];
        const classCell = document.createElement("td");
        classCell.setAttribute("data-group-id", group.id);
        classCell.setAttribute("data-day", dayIndex + 1);
        classCell.setAttribute("data-pair", timeIndex + 1);

        const lesson = lessons.find(lesson => 
          lesson.day === dayIndex + 1 && 
          lesson.numberOfPair === timeIndex + 1 && 
          lesson.groupLessons.some(gl => gl.groupId === group.id) &&
          (lesson.isEvenWeek === isEvenWeek || lesson.isEvenWeek === null)
        );

        if (lesson) {
          const teacherNames = lesson.teacherLessons.map(tl => {
            const positionShort = tl.teacher.position === "Асистент" ? "ас." :
                                  tl.teacher.position === "Доцент" ? "доц." :
                                  tl.teacher.position === "Професор" ? "пр." : "";
            return `${positionShort} ${tl.teacher.fullName}`;
          }).join("<br>");
          const lessonType = lesson.isLecture ? `(лек) ${lesson.hoursOfSubject} год.` : `(пр) ${lesson.hoursOfSubject} год.`;
          const consultationInfo = lesson.haveConsultation ? `<p>(кон) ${lesson.hoursOfConsultation} год.</p>` : "";
          
          // кнопки редагування та видалення
          const editButton = `
            <button class="icon-button edit-button" title="Edit" type="button" onclick="openEditLessonModal(${lesson.id})">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon">
                <path d="M12 20h9"></path>
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"></path>
              </svg>
            </button>`;
          const deleteButton = `
            <button class="icon-button delete-button" title="Delete" type="button" onclick="openDeleteLessonModal(${lesson.id})">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon">
                <path d="M3 6h18"></path>
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path>
                <path d="M10 11v6"></path>
                <path d="M14 11v6"></path>
                <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"></path>
              </svg>
            </button>`;

          classCell.innerHTML = `
            <div class="lesson-controls">
              ${editButton}
              ${deleteButton}
            </div>
            <div class="lesson-info">
              <p><b>${lesson.subject}</b></p>
              <p>${lessonType}</p>
              ${consultationInfo}
              <p>${teacherNames}</p>
            </div>
          `;

          if (lesson.groupLessons.length > 1) {
            classCell.colSpan = lesson.groupLessons.length;
            classCell.style.setProperty('--colspan', (Math.sqrt(lesson.groupLessons.length)).toFixed(2));
            groupIndex += lesson.groupLessons.length - 1;
          } else {
            classCell.style.setProperty('--colspan', 1);
          }

          classCell.removeAttribute("data-group-id");
        }

        timeRow.appendChild(classCell);
      }

      tbody.appendChild(timeRow);
    }

    if (dayIndex !== days.length - 1) {
      const emptyRow = document.createElement("tr");
      const emptyRowCell = document.createElement("td");
      emptyRowCell.colSpan = 2 + filteredGroups.length;
      emptyRow.appendChild(emptyRowCell);
      emptyRowCell.classList.add("empty-row");
      tbody.appendChild(emptyRow);
    }
  }

  return table;
}

function sortGroups(groups) {
  const specialtyPriority = {
    "Прикладна математика": 1,
    "Системний аналіз": 2,
    "Інформатика": 3,
    "Програмна інженерія": 4
  };

  return groups.sort((a, b) => {
    if (a.specialty === b.specialty) {
      const numA = a.name.match(/\d+/);
      const numB = b.name.match(/\d+/);

      if (numA && numB) {
        const numberA = parseInt(numA[0]);
        const numberB = parseInt(numB[0]);
        if (numberA !== numberB) {
          return numberA - numberB;
        }
      }
      // Якщо цифри однакові або їх немає, сортуємо за алфавітом
      return a.name.localeCompare(b.name);
    }
    return specialtyPriority[a.specialty] - specialtyPriority[b.specialty];
  });
}

// ---------------------- ADD LESSON --------------------------------

function getDayName(dayNumber) {
  const days = {
    1: "Понеділок",
    2: "Вівторок",
    3: "Середа",
    4: "Четвер",
    5: "П'ятниця"
  };
  return days[dayNumber] || "";
}
function getNumberOfPair(pair)
{
  const pairs = {
    1: "Перша пара (8:40-10:15)",
    2: "Друга пара (10:35-12:10)",
    3: "Третя пара (12:20-13:55)",
    4: "Четверта пара (14:05-15:40)"
  };
  return pairs[pair] || "";
}

async function CheckFreeTeacher(day, pair) {
  const response = await fetch(`/api/freehours/available-teachers?day=${day}&pair=${pair}`);
  if (!response.ok) {
    return false;
  }
  const teachers = await response.json();
  return teachers;
}
async function CheckSimilarGroup(groupId, day, pair) {
  const group = await fetch(`/api/groups/${groupId}`);
  const groupData = await group.json();
  const specialty = groupData.specialty;
  const course = groupData.course;

  const response = await fetch(`/api/groups/similar-groups?specialty=${encodeURIComponent(specialty)}&course=${course}&day=${day}&pair=${pair}`);
  if (!response.ok) {
    return false;
  }
  const groups = await response.json();
  return groups;
}

function populateTeacherSelect(teachers) {
  const teacherSelect = document.getElementById("teacher-select");
  teacherSelect.innerHTML = '';
  teachers.forEach(teacher => {
    const option = document.createElement("option");
    option.value = teacher.id;
    option.textContent = teacher.fullName;
    teacherSelect.appendChild(option);
  });
}

function populateGroupSelectBySpecialtyAndCourse(groups, groupId) {
  const groupSelect = document.getElementById("group-select");
  groupSelect.innerHTML = '';

  const selectedGroup = groups.find(group => group.id === groupId);
  if (selectedGroup) {
    const option = document.createElement("option");
    option.value = selectedGroup.id;
    option.textContent = selectedGroup.name;
    option.selected = true;
    groups.remove(selectedGroup);
    groupSelect.appendChild(option);
  }

  groups.forEach(group => {
    const option = document.createElement("option");
    option.value = group.id;
    option.textContent = group.name;
    groupSelect.appendChild(option);
  });
}

function openAddLessonModal(groupId, day, pair) {
  customModalContent.innerHTML = "";
  
  const modal = document.createElement("div");
  modal.id = "add-lesson-modal";
  modal.innerHTML = `
    <button class="close-modal" id="close-add-lesson-overlay" type="button" title="Close modal">X</button>
      <form id="add-lesson-form" class="lesson-form">
        <fieldset>
          <legend class="add-form">Додати пару</legend>
          <label for="lesson-subject"><p>Назва предмету:</p></label>
          <input type="text" class="input-add" id="lesson-subject" name="lesson-subject" maxlength="50" minlength="5" required placeholder="Введіть назву предмету...">
          <label for="lesson-day"><p>День:</p></label>
          <input type="text" class="input-add" id="lesson-day" name="lesson-day" value="${getDayName(day)}" readonly>
          <label for="lesson-pair"><p>Пара:</p></label>
          <input type="text" class="input-add" id="lesson-pair" name="lesson-pair" value="${getNumberOfPair(pair)}" readonly>
          <div class="radio-container-div">
            <label><p>Тип предмету:</p></label>
            <label class="radio-container">
              Лекційний
              <input type="radio" name="lesson-isLecture" value="1">
              <span class="checkmark"></span>
            </label>
            <label class="radio-container">
              Практичний
              <input type="radio" name="lesson-isLecture" value="0">
              <span class="checkmark"></span>
            </label>
          </div>
          <label for="teacher-select"><p>Вибір викладача:</p></label>
          <select id="teacher-select" class="input-add" name="lesson-teacher" disabled></select>
          <label for="group-select"><p>Вибір групи:</p></label>
          <select id="group-select" class="input-add" name="lesson-group" disabled></select>
          <label for="lesson-hours"><p>Кількість годин:</p></label>
          <input type="number" class="input-add" id="lesson-hours" placeholder="Введіть кількість годин предмету..." name="lesson-hours" min="6" required>
          <label class="checkbox-container">Консультації
            <input type="checkbox" id="has-consultation" name="lesson-has-consultation">
            <span class="checkmark"></span>
          </label>
          <div id="consultation-hours-container" style="display: none;">
            <label for="consultation-hours"><p>Кількість годин консультацій:</p></label>
            <input type="number" class="input-add" id="consultation-hours" placeholder="Введіть кількість годин консультацій..." name="lesson-consultation-hours" min="1">
          </div>
          <div class="radio-container-div">
            <label><p>Тиждень:</p></label>
            <label class="radio-container">
              Парний
              <input type="radio" name="lesson-is-even-week" value="1">
              <span class="checkmark"></span>
            </label>
            <label class="radio-container">
              Непарний
              <input type="radio" name="lesson-is-even-week" value="0">
              <span class="checkmark"></span>
            </label>
            <label class="radio-container">
              Не поділяється
              <input type="radio" name="lesson-is-even-week" value="2" checked>
              <span class="checkmark"></span>
            </label>
          </div>
        </fieldset>
        <button type="submit" class="submit-button">Додати</button>
      </form>
  `;
  customModalContent.appendChild(modal);
  
  const addLessonForm = document.getElementById("add-lesson-form");
  const consultationContainer = document.getElementById("consultation-hours-container");
  const teacherSelect = document.getElementById("teacher-select");
  const groupSelect = document.getElementById("group-select");
  const closeAddLessonOverlay = document.getElementById("close-add-lesson-overlay");
  
  document.getElementById("has-consultation").addEventListener("change", (e) => {
    consultationContainer.style.display = e.target.checked ? "block" : "none";
  });

  document.querySelectorAll('input[name="lesson-isLecture"]').forEach(radio => {
    radio.addEventListener("change", (e) => {
     teacherSelect.disabled = false;
  
      if (e.target.value === "1") {
        teacherSelect.multiple = false;
        groupSelect.multiple = true;
        groupSelect.disabled = false;
      } else {
        teacherSelect.multiple = true;
        groupSelect.multiple = false;
        selectGroupById(groupSelect, groupId);
        groupSelect.disabled = true;
      }

      if (teacherSelect.options.length > 0) {
        const firstTeacherId = teacherSelect.options[0].value;
        teacherCardsContainer.innerHTML = '';
  
        const teacherCard = document.createElement("div");
        teacherCard.classList.add("teacher-card");
        teacherCard.id = `teacher-card-${firstTeacherId}`;
        teacherCardsContainer.appendChild(teacherCard);
        showTeacherCard(firstTeacherId, day, pair, teacherCard.id);
  
        addLessonContentWithTeacher();
      }
    });
  });

  teacherSelect.addEventListener("change", async () => {
    let selectedTeachers = Array.from(teacherSelect.selectedOptions).map(option => option.value);

    if (selectedTeachers.length > 2) {
      showMessage("Відображаються лише два останні профілі викладачів", "warning", 4000);
      selectedTeachers = selectedTeachers.slice(-2);
    }

    teacherCardsContainer.innerHTML = '';

    for (const teacherId of selectedTeachers) {
      const teacherCard = document.createElement("div");
      teacherCard.classList.add("teacher-card");
      teacherCard.id = `teacher-card-${teacherId}`;
      teacherCardsContainer.appendChild(teacherCard);
      await showTeacherCard(teacherId, day, pair, teacherCard.id);
    }
    addLessonContentWithTeacher();
  });

  closeAddLessonOverlay.addEventListener('click', () => {
    customModal.style.display = 'none';
    teacherCardsContainer.innerHTML = '';
    disableLessonContentWithTeacher();
  });

  addLessonForm.addEventListener('submit', async (event) => {
    event.preventDefault();
  
    const formData = new FormData(addLessonForm);

    const getSelectedValues = (selectElement) => {
      return Array.from(selectElement.selectedOptions).map(option => option.value);
    };

    const lessonData = {
      lesson: {
        day: day,
        numberOfPair: pair,
        subject: formData.get("lesson-subject"),
        hoursOfSubject: formData.get("lesson-hours"),
        hoursOfConsultation: formData.get("lesson-consultation-hours") || null,
        haveConsultation: formData.get("lesson-has-consultation") === 'on' ? true : false,
        isLecture: formData.get("lesson-isLecture") === '1' ? true : false,
        isEvenWeek: formData.get("lesson-is-even-week") === '1' ? true : formData.get("lesson-is-even-week") === '0' ? false : null
      },
      teacherIds: getSelectedValues(document.querySelector("select[name='lesson-teacher']")),
      groupIds: getSelectedValues(document.querySelector("select[name='lesson-group']"))
    };

    try {
      const response = await fetch('/api/lessons/with-details', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(lessonData)
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        showMessage(errorData.message || "Помилка додавання заняття!", "error", 2000);
        throw new Error('Server error');
      }

      closeAddLessonOverlay.click();
      showMessage("Пару успішно додано!", "success", 2000);
      loadSchedule();
      
    } catch (error) {
      console.error("There was a problem with the fetch operation:", error);
    }
  });

}

function openEditLessonModal(lessonId) {
  customModalContent.innerHTML = "";

  const modal = document.createElement("div");
  modal.id = "edit-lesson-modal";
  modal.innerHTML = `
    <button class="close-modal" id="close-edit-lesson-overlay" type="button" title="Close modal">X</button>
    <form id="edit-lesson-form" class="lesson-form">
      <fieldset>
        <legend class="add-form">Редагувати пару</legend>
        <label for="edit-lesson-subject"><p>Назва предмету:</p></label>
        <input type="text" class="input-add" id="edit-lesson-subject" name="lesson-subject" maxlength="50" minlength="5" required placeholder="Введіть назву предмету...">
        <label for="edit-lesson-hours"><p>Кількість годин:</p></label>
        <input type="number" class="input-add" id="edit-lesson-hours" placeholder="Введіть кількість годин предмету..." name="lesson-hours" min="6" required>
        <label class="checkbox-container">Консультації
          <input type="checkbox" id="edit-has-consultation" name="lesson-has-consultation">
          <span class="checkmark"></span>
        </label>
        <div id="edit-consultation-hours-container" style="display: none;">
          <label for="edit-consultation-hours"><p>Кількість годин консультацій:</p></label>
          <input type="number" class="input-add" id="edit-consultation-hours" placeholder="Введіть кількість годин консультацій..." name="lesson-consultation-hours" min="1">
        </div>
      </fieldset>
      <button type="submit" class="submit-button">Зберегти</button>
    </form>
  `;
  customModalContent.appendChild(modal);

  const editLessonForm = document.getElementById("edit-lesson-form");
  const consultationContainer = document.getElementById("edit-consultation-hours-container");
  const closeEditLessonOverlay = document.getElementById("close-edit-lesson-overlay");

  document.getElementById("edit-has-consultation").addEventListener("change", (e) => {
    consultationContainer.style.display = e.target.checked ? "block" : "none";
  });

  closeEditLessonOverlay.addEventListener('click', () => {
    customModal.style.display = 'none';
  });

  let initialLessonData = [];

  fetch(`/api/lessons/${lessonId}`)
    .then(response => response.json())
    .then(lesson => {
      document.getElementById("edit-lesson-subject").value = lesson.subject;
      document.getElementById("edit-lesson-hours").value = lesson.hoursOfSubject;
      document.getElementById("edit-has-consultation").checked = lesson.haveConsultation;
      if (lesson.haveConsultation) {
        consultationContainer.style.display = "block";
        document.getElementById("edit-consultation-hours").value = lesson.hoursOfConsultation;
      }
      initialLessonData = {
        subject: String(lesson.subject),
        hoursOfSubject: String(lesson.hoursOfSubject),
        hoursOfConsultation: lesson.hoursOfConsultation ? String(lesson.hoursOfConsultation) : "",
        haveConsultation: Boolean(lesson.haveConsultation),
      };
    })
    .catch(error => {
      console.error("Error loading lesson:", error);
    });

  editLessonForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = new FormData(editLessonForm);

    const lessonData = {
      subject: formData.get("lesson-subject"),
      hoursOfSubject: formData.get("lesson-hours"),
      hoursOfConsultation: formData.get("lesson-consultation-hours") || null,
      haveConsultation: formData.get("lesson-has-consultation") === 'on' ? true : false
    };

    if (JSON.stringify(lessonData) === JSON.stringify(initialLessonData)) {
      showMessage("Ви не внесли жодних змін!", "error", 2000);
      return
    }

    try {
      const response = await fetch(`/api/lessons/${lessonId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(lessonData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        showMessage(errorData.message || "Помилка редагування заняття!", "error", 2000);
        throw new Error('Server error');
      }

      closeEditLessonOverlay.click();
      showMessage("Пару успішно відредаговано!", "success", 2000);
      loadSchedule();

    } catch (error) {
      console.error("There was a problem with the fetch operation:", error);
    }
  });

  customModal.style.display = 'block';
}

function selectGroupById(groupSelect, groupId) {
  for (let i = 0; i < groupSelect.options.length; i++) {
    if (groupSelect.options[i].value == groupId) {
      groupSelect.selectedIndex = i;
      break;
    }
  }
}

async function showTeacherCard(teacherId, day, pair, cardId) {
  const teacherCard = document.getElementById(cardId);
  try {
    const responseTeacher = await fetch(`/api/teachers/${teacherId}`);
    const teacher = await responseTeacher.json();

    teacherCard.innerHTML = `
      <h2><b>ПІБ: </b><i>${teacher.fullName}</i></h2>
      <p><b>Позиція: </b><i>${teacher.position}</i></p>
      <table class="teacher-card-schedule-table">
        <thead>
          <tr>
            <th>№ пари</th>
            <th>Понеділок</th>
            <th>Вівторок</th>
            <th>Середа</th>
            <th>Четвер</th>
            <th>П'ятниця</th>
          </tr>
        </thead>
        <tbody>
          ${generateTeacherCardScheduleTable(cardId)}
        </tbody>
      </table>
    `;

    await highlightTeacherCardFreeHours(teacherId, day, pair, cardId);

  } catch (error) {
    console.error("Error loading teacher:", error);
  }
  teacherCard.classList.add("show");
}

function generateTeacherCardScheduleTable(cardId) {
  const times = ["1", "2", "3", "4"];
  return times.map(time => `
    <tr>
      <td>${time}</td>
      <td id="${cardId}-cell-1-${time}" class="teacher-card-time-cell"></td>
      <td id="${cardId}-cell-2-${time}" class="teacher-card-time-cell"></td>
      <td id="${cardId}-cell-3-${time}" class="teacher-card-time-cell"></td>
      <td id="${cardId}-cell-4-${time}" class="teacher-card-time-cell"></td>
      <td id="${cardId}-cell-5-${time}" class="teacher-card-time-cell"></td>
    </tr>
  `).join('');
}

async function highlightTeacherCardFreeHours(teacherId, day, pair, cardId) {
  try {
    const response = await fetch(`/api/freehours/teacher/${teacherId}`);
    if (!response.ok) {
      throw new Error("Failed to fetch free hours");
    }
    const data = await response.json();
    const AvailableHours = data.availableHours;
    const OccupiedHours = data.occupiedHours;

    AvailableHours.forEach(freeHour => {
      const cellId = `${cardId}-cell-${freeHour.day}-${freeHour.numberOfPair}`;
      const cell = document.getElementById(cellId);
      if (cell) {
        cell.classList.add('selected');
      }
    });

    for (const occupiedHour of OccupiedHours) {
      const cellId = `${cardId}-cell-${occupiedHour.day}-${occupiedHour.numberOfPair}`;
      const cell = document.getElementById(cellId);
      if (cell) {
        cell.classList.add('not-free');
        const lessonResponse = await fetch(`/api/lessons/${occupiedHour.lessonId}`);
        if (lessonResponse.ok) {
          const lesson = await lessonResponse.json();
          const groupNames = await Promise.all(
            lesson.groupLessons.map(async (groupLesson) => {
              const groupResponse = await fetch(`/api/groups/${groupLesson.groupId}`);
              if (groupResponse.ok) {
                const group = await groupResponse.json();
                return group.name;
              }
              return null;
            })
          );
            cell.innerHTML = `<p><b>${lesson.subject} (${lesson.isLecture ? 'Л' : 'П'})</b></p><p>${groupNames.filter(name => name).join(', ')}</p>`;
        }
      }
    }

    if (day && pair) {
      const highlightCellId = `${cardId}-cell-${day}-${pair}`;
      const highlightCell = document.getElementById(highlightCellId);
      if (highlightCell) {
        highlightCell.classList.add('highlight');
      }
    }

  } catch (error) {
    console.error("Error highlighting free hours:", error);
  }
}

// ---overlay for add lesson ---------------------
const teacherCardsContainer = document.getElementById("teacher-cards-container");
const addLessonContent = document.getElementById("add-lesson-content");

const customModal = document.getElementById('add-lesson-overlay');
const customModalContent = document.getElementById('add-lesson-content');

window.addEventListener('click', (event) => {
  if (event.target === customModal) {
    customModal.style.display = 'none';
    teacherCardsContainer.innerHTML = '';
    disableLessonContentWithTeacher();
  }
});

function addLessonContentWithTeacher() {
  const lessonContent = document.querySelector('.add-lesson-content');
  lessonContent.classList.add('add-lesson-content-with-teacher');
}
function disableLessonContentWithTeacher() {
  const lessonContent = document.querySelector('.add-lesson-content');
  lessonContent.classList.remove('add-lesson-content-with-teacher');
}
