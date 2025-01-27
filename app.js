const courses = ["1 КУРС", "2 КУРС", "3 КУРС", "4 КУРС"];
  let currentIndex = 0;

  function navigate(direction) {
    currentIndex = (currentIndex + direction + courses.length) % courses.length; // Циклічний перехід
    document.getElementById("courseValue").textContent = courses[currentIndex];
  }


  const addGroupsButton = document.getElementById("add-groups");
  const closeModalButton = document.getElementById("close-modal");
  const modalWindow = document.getElementById("modal-window");
  const header = document.querySelector("header");
  const container = document.querySelector(".container");
  const submitButton = document.querySelector(".submit-button");

  addGroupsButton.addEventListener("click", () => {
    modalWindow.style.display = "block";
    header.classList.add("blur");
    container.classList.add("blur");
});

closeModalButton.addEventListener("click", () => {
    modalWindow.style.display = "none";
    container.classList.remove("blur");
    header.classList.remove("blur");
});

