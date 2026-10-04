// Get the main elements from the page
const searchInput = document.getElementById("searchInput");
const projectGrid = document.getElementById("projectGrid");
const projectCards = document.querySelectorAll(".project-card");
const filterButtons = document.querySelectorAll(".filter-button");

const gridButton = document.getElementById("gridButton");
const listButton = document.getElementById("listButton");

const projectCount = document.getElementById("projectCount");
const categoryCount = document.getElementById("categoryCount");
const noResults = document.getElementById("noResults");

// Keep track of the selected category
let activeFilter = "all";

// Show the total amount of projects
projectCount.textContent = projectCards.length;

// Count the different categories
const categories = new Set();

projectCards.forEach((card) => {
    const cardCategories = card.dataset.category.split(" ");

    cardCategories.forEach((category) => {
        categories.add(category);
    });
});

categoryCount.textContent = categories.size;

// Search and filter projects
function updateProjects() {
    const searchText = searchInput.value.toLowerCase().trim();

    let visibleProjects = 0;

    projectCards.forEach((card) => {
        const title = card.dataset.title.toLowerCase();
        const text = card.textContent.toLowerCase();
        const categories = card.dataset.category.split(" ");

        const matchesSearch =
            title.includes(searchText) ||
            text.includes(searchText);

        const matchesFilter =
            activeFilter === "all" ||
            categories.includes(activeFilter);

        if (matchesSearch && matchesFilter) {
            card.style.display = "";
            visibleProjects++;
        } else {
            card.style.display = "none";
        }
    });

    if (visibleProjects === 0) {
        noResults.style.display = "block";
    } else {
        noResults.style.display = "none";
    }
}

// Search when the user types
searchInput.addEventListener("input", updateProjects);

// Filter buttons
filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
        filterButtons.forEach((otherButton) => {
            otherButton.classList.remove("active");
        });

        button.classList.add("active");
        activeFilter = button.dataset.filter;

        updateProjects();
    });
});

// Grid view
gridButton.addEventListener("click", () => {
    projectGrid.classList.remove("list-view");

    gridButton.classList.add("active");
    listButton.classList.remove("active");
});

// List view
listButton.addEventListener("click", () => {
    projectGrid.classList.add("list-view");

    listButton.classList.add("active");
    gridButton.classList.remove("active");
});

// Press "/" to jump to the search bar
document.addEventListener("keydown", (event) => {
    if (
        event.key === "/" &&
        document.activeElement !== searchInput
    ) {
        event.preventDefault();
        searchInput.focus();
    }
});
