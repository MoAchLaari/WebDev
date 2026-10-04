const searchInput = document.getElementById("searchInput");
const focusSearchButton = document.getElementById("focusSearch");

const semesterTabs = document.querySelectorAll(".semester-tab");
const semesterPanels = document.querySelectorAll(".semester-panel");
const projectCards = document.querySelectorAll(".project-card");

const projectCount = document.getElementById("projectCount");
const emptyState = document.getElementById("emptyState");

const codeModal = document.getElementById("codeModal");
const modalProjectTitle = document.getElementById("modalProjectTitle");
const codeTabs = document.querySelectorAll(".code-tab");
const codeDisplay = document.getElementById("codeDisplay");
const codeFilePath = document.getElementById("codeFilePath");
const lineNumbers = document.getElementById("lineNumbers");
const copyCodeButton = document.getElementById("copyCode");

let activeSemester = "semester1";
let activeProjectFolder = "";
let activeFile = "index.html";

projectCount.textContent = projectCards.length;
document.getElementById("year").textContent = new Date().getFullYear();

updateCounters();


// --------------------
// SEMESTER NAVIGATION
// --------------------

semesterTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
        activeSemester = tab.dataset.semester;

        semesterTabs.forEach((button) => {
            button.classList.remove("active");
        });

        semesterPanels.forEach((panel) => {
            panel.classList.remove("active");
        });

        tab.classList.add("active");
        document.getElementById(activeSemester).classList.add("active");

        filterProjects();
    });
});


// --------------------
// SEARCH
// --------------------

searchInput.addEventListener("input", filterProjects);

focusSearchButton.addEventListener("click", () => {
    document.getElementById("projects").scrollIntoView({
        behavior: "smooth"
    });

    setTimeout(() => {
        searchInput.focus();
    }, 450);
});

document.addEventListener("keydown", (event) => {
    if (
        event.key === "/" &&
        document.activeElement !== searchInput
    ) {
        event.preventDefault();
        searchInput.focus();
    }

    if (event.key === "Escape" && codeModal.classList.contains("open")) {
        closeCodeModal();
    }
});


function filterProjects() {
    const searchText = searchInput.value.toLowerCase().trim();

    const currentPanel = document.getElementById(activeSemester);
    const currentCards = currentPanel.querySelectorAll(".project-card");

    let visibleCount = 0;

    currentCards.forEach((card) => {
        const title = card.dataset.title.toLowerCase();
        const description = card.dataset.description.toLowerCase();
        const fullText = card.textContent.toLowerCase();

        const matches =
            title.includes(searchText) ||
            description.includes(searchText) ||
            fullText.includes(searchText);

        card.classList.toggle("hidden", !matches);

        if (matches) {
            visibleCount++;
        }
    });

    emptyState.style.display = visibleCount === 0 ? "block" : "none";

    updateCounters();
}


function updateCounters() {
    semesterPanels.forEach((panel) => {
        const allCards = panel.querySelectorAll(".project-card");
        const visibleCards = panel.querySelectorAll(
            ".project-card:not(.hidden)"
        );

        const counter = panel.querySelector(".project-counter");

        counter.textContent =
            `${visibleCards.length} / ${allCards.length} PROJECTS`;
    });
}


// --------------------
// SOURCE CODE VIEWER
// --------------------

document.querySelectorAll(".source-button").forEach((button) => {
    button.addEventListener("click", () => {
        const card = button.closest(".project-card");

        activeProjectFolder = card.dataset.folder;
        activeFile = "index.html";

        modalProjectTitle.textContent = card.dataset.title;

        codeTabs.forEach((tab) => {
            tab.classList.toggle(
                "active",
                tab.dataset.file === activeFile
            );
        });

        openCodeModal();
        loadCodeFile();
    });
});


codeTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
        activeFile = tab.dataset.file;

        codeTabs.forEach((otherTab) => {
            otherTab.classList.remove("active");
        });

        tab.classList.add("active");

        loadCodeFile();
    });
});


document.querySelectorAll("[data-close-modal]").forEach((element) => {
    element.addEventListener("click", closeCodeModal);
});


function openCodeModal() {
    codeModal.classList.add("open");
    codeModal.setAttribute("aria-hidden", "false");

    document.body.style.overflow = "hidden";
}


function closeCodeModal() {
    codeModal.classList.remove("open");
    codeModal.setAttribute("aria-hidden", "true");

    document.body.style.overflow = "";
}


async function loadCodeFile() {
    const path = `${activeProjectFolder}/${activeFile}`;

    codeDisplay.textContent = "Loading...";
    lineNumbers.textContent = "";
    codeFilePath.textContent = path;

    try {
        const response = await fetch(path);

        if (!response.ok) {
            throw new Error("File not found");
        }

        const code = await response.text();

        codeDisplay.textContent = code;
        addLineNumbers(code);
    } catch (error) {
        const message =
`Could not load: ${path}

Make sure the project uses this structure:

${activeProjectFolder}/
    index.html
    style.css
    script.js

The source viewer works when the website is hosted on GitHub Pages.`;

        codeDisplay.textContent = message;
        addLineNumbers(message);
    }
}


function addLineNumbers(code) {
    const lines = code.split("\n").length;

    lineNumbers.textContent = Array.from(
        { length: lines },
        (_, index) => index + 1
    ).join("\n");
}


// --------------------
// COPY CODE
// --------------------

copyCodeButton.addEventListener("click", async () => {
    const code = codeDisplay.textContent;

    try {
        await navigator.clipboard.writeText(code);

        const oldText = copyCodeButton.textContent;

        copyCodeButton.textContent = "Copied";

        setTimeout(() => {
            copyCodeButton.textContent = oldText;
        }, 1200);
    } catch (error) {
        copyCodeButton.textContent = "Copy failed";

        setTimeout(() => {
            copyCodeButton.textContent = "Copy Code";
        }, 1200);
    }
});
