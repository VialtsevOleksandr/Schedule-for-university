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
  const submitButton = document.querySelector(".submit-button");
  const addTeacherForm = document.getElementById("add-teachers-form");
  const addGroupForm = document.getElementById("add-groups-form");
  const buttons = document.querySelectorAll("button:not(#modal-window button)");

function disabledButton() {
  buttons.forEach(button => {
    button.disabled = true;
  });
}
function enabledButton() {
  buttons.forEach(button => {
    button.disabled = false;
  });
}

addGroupsButton.addEventListener("click", () => {
  disabledButton();
  modalWindow.style.display = "block";
  addGroupForm.style.display = "block";
  header.classList.add("blur");
  container.classList.add("blur");
});

addTeachersButton.addEventListener("click", () => {
  disabledButton();
  modalWindow.style.display = "block";
  addTeacherForm.style.display = "block";
  header.classList.add("blur");
  container.classList.add("blur");
});

closeModalButton.addEventListener("click", () => {
  enabledButton();
  modalWindow.style.display = "none";
  addTeacherForm.style.display = "none";
  addGroupForm.style.display = "none";
  container.classList.remove("blur");
  header.classList.remove("blur");
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

