(function () {

    const $ = (selector, root = document) =>
        root.querySelector(selector);

    const $$ = (selector, root = document) =>
        [...root.querySelectorAll(selector)];


    const searchInput = $("#searchInput");
    const openAllBtn = $("#openAllBtn");
    const closeAllBtn = $("#closeAllBtn");
    const emptyState = $("#emptyState");

    const semesterTabs = $$(".semester-tab");
    const semesters = $$(".semester");

    const codeModal = $("#codeModal");
    const codeProjectName = $("#codeProjectName");
    const codePath = $("#codePath");
    const codeDisplay = $("#codeDisplay");
    const lineNumbers = $("#lineNumbers");
    const codeTabs = $$(".code-tab");
    const copyCodeBtn = $("#copyCodeBtn");

    let activeSemester = "semester1";
    let activeCodeType = "html";

    let currentProjectName = "";
    let currentProjectUrl = "";

    let codeFiles = {
        html: null,
        css: null,
        js: null
    };


    // -------------------------------------------------
    // BUILD PROJECT ROWS AUTOMATICALLY
    // -------------------------------------------------
    //
    // In the HTML you only write:
    //
    // <details class="lab">
    //     <summary>Labo 1</summary>
    //
    //     <div class="projects">
    //         <a href="path/index.html">Project Name</a>
    //     </div>
    // </details>
    //
    // This JavaScript turns every link into a full row
    // with an Open button and a Code button.
    // -------------------------------------------------

    function buildProjectRows() {

        $$(".projects").forEach((projectContainer) => {

            const links =
                $$(":scope > a[href]", projectContainer);

            links.forEach((link, index) => {

                const projectName =
                    link.textContent.trim();

                const projectUrl =
                    link.getAttribute("href");


                const row =
                    document.createElement("div");

                row.className =
                    "project-row";

                row.dataset.search =
                    (
                        projectName + " " +
                        projectUrl
                    ).toLowerCase();


                row.innerHTML = `
                    <div class="project-left">

                        <span class="project-number">
                            ${String(index + 1).padStart(2, "0")}
                        </span>

                        <a
                            class="project-link"
                            href="${projectUrl}"
                        >
                            ${projectName}
                        </a>

                    </div>


                    <div class="project-buttons">

                        <a
                            class="open-button"
                            href="${projectUrl}"
                        >
                            Open
                        </a>

                        <button
                            class="code-button"
                            type="button"
                            data-url="${projectUrl}"
                            data-name="${projectName}"
                        >
                            Code
                        </button>

                    </div>
                `;


                link.replaceWith(row);

            });

        });

    }


    // -------------------------------------------------
    // COUNTS
    // -------------------------------------------------

    function updateCounts() {

        semesters.forEach((semester) => {

            const visibleProjects =
                $$(".project-row", semester)
                    .filter(
                        (project) =>
                            !project.hidden
                    );

            const counter =
                $(".semester-count", semester);

            counter.textContent =
                `${visibleProjects.length} projects`;

        });

    }


    // -------------------------------------------------
    // SEMESTER SWITCHING
    // -------------------------------------------------

    semesterTabs.forEach((tab) => {

        tab.addEventListener("click", () => {

            activeSemester =
                tab.dataset.semester;


            semesterTabs.forEach((button) => {

                button.classList.toggle(
                    "active",
                    button === tab
                );

            });


            semesters.forEach((semester) => {

                semester.classList.toggle(
                    "active",
                    semester.id === activeSemester
                );

            });


            filterProjects();

        });

    });


    // -------------------------------------------------
    // SEARCH
    // -------------------------------------------------

    function filterProjects() {

        const query =
            searchInput.value
                .trim()
                .toLowerCase();


        let anythingVisible =
            false;


        semesters.forEach((semester) => {

            $$(".lab", semester)
                .forEach((lab) => {

                    const labName =
                        $("summary", lab)
                            .textContent
                            .toLowerCase();

                    const projects =
                        $$(".project-row", lab);

                    let projectMatch =
                        false;


                    projects.forEach((project) => {

                        const matches =
                            !query ||
                            labName.includes(query) ||
                            project.dataset.search.includes(query);


                        project.hidden =
                            !matches;


                        if (matches) {
                            projectMatch = true;
                        }

                    });


                    const labMatches =
                        !query ||
                        labName.includes(query) ||
                        projectMatch;


                    lab.hidden =
                        !labMatches;


                    if (
                        query &&
                        labMatches
                    ) {
                        lab.open = true;
                    }

                });

        });


        const activePanel =
            document.getElementById(
                activeSemester
            );


        anythingVisible =
            $$(".lab", activePanel)
                .some(
                    (lab) =>
                        !lab.hidden
                );


        emptyState.hidden =
            anythingVisible ||
            $$(".lab", activePanel).length === 0;


        updateCounts();

    }


    searchInput.addEventListener(
        "input",
        filterProjects
    );


    // -------------------------------------------------
    // OPEN / CLOSE LABS
    // -------------------------------------------------

    openAllBtn.addEventListener(
        "click",
        () => {

            const activePanel =
                document.getElementById(
                    activeSemester
                );

            $$(".lab", activePanel)
                .forEach((lab) => {

                    if (!lab.hidden) {
                        lab.open = true;
                    }

                });

        }
    );


    closeAllBtn.addEventListener(
        "click",
        () => {

            const activePanel =
                document.getElementById(
                    activeSemester
                );

            $$(".lab", activePanel)
                .forEach((lab) => {
                    lab.open = false;
                });

        }
    );


    // -------------------------------------------------
    // CTRL + /
    // -------------------------------------------------

    document.addEventListener(
        "keydown",
        (event) => {

            if (
                event.ctrlKey &&
                event.key === "/"
            ) {
                event.preventDefault();

                searchInput.focus();
                searchInput.select();
            }


            if (
                event.key === "Escape" &&
                codeModal.classList.contains("open")
            ) {
                closeCodeModal();
                return;
            }


            if (event.key === "Escape") {

                searchInput.value = "";

                filterProjects();

                searchInput.blur();

            }

        }
    );


    // -------------------------------------------------
    // CODE BUTTONS
    // -------------------------------------------------

    function connectCodeButtons() {

        $$(".code-button")
            .forEach((button) => {

                button.addEventListener(
                    "click",
                    () => {

                        currentProjectName =
                            button.dataset.name;

                        currentProjectUrl =
                            button.dataset.url;

                        activeCodeType =
                            "html";


                        codeProjectName.textContent =
                            currentProjectName;


                        codeTabs.forEach((tab) => {

                            tab.classList.toggle(
                                "active",
                                tab.dataset.type === "html"
                            );

                        });


                        openCodeModal();

                        loadProjectCode();

                    }
                );

            });

    }


    // -------------------------------------------------
    // CODE MODAL
    // -------------------------------------------------

    function openCodeModal() {

        codeModal.classList.add(
            "open"
        );

        codeModal.setAttribute(
            "aria-hidden",
            "false"
        );

        document.body.classList.add(
            "modal-open"
        );

    }


    function closeCodeModal() {

        codeModal.classList.remove(
            "open"
        );

        codeModal.setAttribute(
            "aria-hidden",
            "true"
        );

        document.body.classList.remove(
            "modal-open"
        );

    }


    $$("[data-close-modal]")
        .forEach((element) => {

            element.addEventListener(
                "click",
                closeCodeModal
            );

        });


    codeTabs.forEach((tab) => {

        tab.addEventListener(
            "click",
            () => {

                activeCodeType =
                    tab.dataset.type;


                codeTabs.forEach((button) => {

                    button.classList.toggle(
                        "active",
                        button === tab
                    );

                });


                showCode();

            }
        );

    });


    // -------------------------------------------------
    // LOAD HTML / CSS / JS
    // -------------------------------------------------

    async function loadProjectCode() {

        codeFiles = {
            html: null,
            css: null,
            js: null
        };


        codeDisplay.textContent =
            "Loading...";

        lineNumbers.textContent =
            "1";

        codePath.textContent =
            currentProjectUrl;


        try {

            const htmlUrl =
                new URL(
                    currentProjectUrl,
                    window.location.href
                );


            const htmlResponse =
                await fetch(htmlUrl.href);


            if (!htmlResponse.ok) {
                throw new Error(
                    "Project HTML could not be loaded."
                );
            }


            const html =
                await htmlResponse.text();


            codeFiles.html = {
                path: currentProjectUrl,
                code: html
            };


            const parser =
                new DOMParser();


            const projectDocument =
                parser.parseFromString(
                    html,
                    "text/html"
                );


            await Promise.all([

                loadCss(
                    projectDocument,
                    htmlUrl
                ),

                loadJs(
                    projectDocument,
                    htmlUrl
                )

            ]);


            showCode();

        } catch (error) {

            const message =
`Could not load this project.

${currentProjectUrl}

The code viewer works when the website is running on GitHub Pages.

${error.message}`;


            codeFiles.html = {
                path: currentProjectUrl,
                code: message
            };


            codeFiles.css = {
                path: "No CSS loaded",
                code: "No CSS file could be loaded."
            };


            codeFiles.js = {
                path: "No JavaScript loaded",
                code: "No JavaScript file could be loaded."
            };


            showCode();

        }

    }


    async function loadCss(
        projectDocument,
        htmlUrl
    ) {

        const stylesheet =
            [
                ...projectDocument.querySelectorAll(
                    'link[rel="stylesheet"][href]'
                )
            ].find((link) => {

                const href =
                    link.getAttribute("href");

                return (
                    href &&
                    !href.startsWith("http") &&
                    !href.startsWith("//")
                );

            });


        if (!stylesheet) {

            codeFiles.css = {
                path: "No local CSS file",
                code: "No local CSS file was found in this project."
            };

            return;

        }


        const cssUrl =
            new URL(
                stylesheet.getAttribute("href"),
                htmlUrl
            );


        try {

            const response =
                await fetch(cssUrl.href);


            codeFiles.css = {
                path: cssUrl.pathname,
                code: await response.text()
            };

        } catch {

            codeFiles.css = {
                path: cssUrl.pathname,
                code: "The CSS file could not be loaded."
            };

        }

    }


    async function loadJs(
        projectDocument,
        htmlUrl
    ) {

        const script =
            [
                ...projectDocument.querySelectorAll(
                    "script[src]"
                )
            ].find((scriptTag) => {

                const src =
                    scriptTag.getAttribute("src");

                return (
                    src &&
                    !src.startsWith("http") &&
                    !src.startsWith("//")
                );

            });


        if (!script) {

            codeFiles.js = {
                path: "No local JavaScript file",
                code: "No local JavaScript file was found in this project."
            };

            return;

        }


        const jsUrl =
            new URL(
                script.getAttribute("src"),
                htmlUrl
            );


        try {

            const response =
                await fetch(jsUrl.href);


            codeFiles.js = {
                path: jsUrl.pathname,
                code: await response.text()
            };

        } catch {

            codeFiles.js = {
                path: jsUrl.pathname,
                code: "The JavaScript file could not be loaded."
            };

        }

    }


    function showCode() {

        const file =
            codeFiles[activeCodeType];


        if (!file) {

            codePath.textContent =
                "Loading...";

            codeDisplay.textContent =
                "Loading...";

            lineNumbers.textContent =
                "1";

            return;

        }


        codePath.textContent =
            file.path;


        codeDisplay.textContent =
            file.code;


        const amountOfLines =
            file.code.split("\n").length;


        lineNumbers.textContent =
            Array.from(
                {
                    length: amountOfLines
                },
                (_, index) =>
                    index + 1
            ).join("\n");

    }


    // -------------------------------------------------
    // COPY CODE
    // -------------------------------------------------

    copyCodeBtn.addEventListener(
        "click",
        async () => {

            const file =
                codeFiles[activeCodeType];


            if (!file) {
                return;
            }


            try {

                await navigator.clipboard.writeText(
                    file.code
                );


                copyCodeBtn.textContent =
                    "Copied";


                setTimeout(() => {

                    copyCodeBtn.textContent =
                        "Copy";

                }, 1000);

            } catch {

                copyCodeBtn.textContent =
                    "Failed";


                setTimeout(() => {

                    copyCodeBtn.textContent =
                        "Copy";

                }, 1000);

            }

        }
    );


    // -------------------------------------------------
    // START PAGE
    // -------------------------------------------------

    buildProjectRows();

    connectCodeButtons();

    updateCounts();

})();
