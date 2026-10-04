(function () {
    const $ = (selector, root = document) => root.querySelector(selector);
    const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

    const searchInput = $("#searchInput");
    const emptyState = $("#emptyState");

    const openAllBtn = $("#openAllBtn");
    const closeAllBtn = $("#closeAllBtn");
    const focusSearchBtn = $("#focusSearchBtn");

    const semesterTabs = $$(".semester-tab");
    const semesterPanels = $$(".semester-panel");

    const sourceModal = $("#sourceModal");
    const sourceProjectName = $("#sourceProjectName");
    const sourcePath = $("#sourcePath");
    const sourceCode = $("#sourceCode");
    const lineNumbers = $("#lineNumbers");
    const sourceTabs = $$(".source-tab");
    const copyCodeBtn = $("#copyCodeBtn");

    const allLabs = $$("details.lab");

    let activeSemester = "semester-1";
    let activeSourceType = "html";

    let currentProject = {
        name: "",
        url: ""
    };

    let sourceFiles = {
        html: null,
        css: null,
        js: null
    };


    // ------------------------------------
    // SMALL HELPERS
    // ------------------------------------

    function escapeRegExp(text) {
        return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    }


    function clearHighlights(root = document) {
        $$("mark", root).forEach((mark) => {
            mark.replaceWith(
                document.createTextNode(mark.textContent)
            );
        });
    }


    function highlightText(element, query) {
        if (!element) {
            return;
        }

        const original =
            element.dataset.originalText ||
            element.textContent;

        element.dataset.originalText = original;

        if (!query) {
            element.textContent = original;
            return;
        }

        const regex =
            new RegExp(
                `(${escapeRegExp(query)})`,
                "gi"
            );

        element.innerHTML =
            original.replace(
                regex,
                "<mark>$1</mark>"
            );
    }


    function getActivePanel() {
        return document.getElementById(activeSemester);
    }


    // ------------------------------------
    // SEMESTER TABS
    // ------------------------------------

    semesterTabs.forEach((tab) => {
        tab.addEventListener("click", () => {
            activeSemester = tab.dataset.target;

            semesterTabs.forEach((button) => {
                const isActive =
                    button === tab;

                button.classList.toggle(
                    "active",
                    isActive
                );

                button.setAttribute(
                    "aria-selected",
                    String(isActive)
                );
            });

            semesterPanels.forEach((panel) => {
                panel.classList.toggle(
                    "active",
                    panel.id === activeSemester
                );
            });

            applyFilter(searchInput.value);
        });
    });


    // ------------------------------------
    // SEARCH
    // ------------------------------------

    function applyFilter(rawValue) {
        const query =
            rawValue.trim().toLowerCase();

        clearHighlights();

        let anythingVisible = false;

        semesterPanels.forEach((panel) => {
            const labs =
                $$("details.lab", panel);

            labs.forEach((lab) => {
                const labTitle =
                    $(".lab-title strong", lab);

                const labText =
                    labTitle
                        ? labTitle.textContent.toLowerCase()
                        : "";

                const items =
                    $$(".project-item", lab);

                let visibleProjects = 0;

                items.forEach((item) => {
                    const projectName =
                        $(".project-name", item);

                    const projectText =
                        item.dataset.search ||
                        item.textContent.toLowerCase();

                    const matches =
                        !query ||
                        projectText.includes(query) ||
                        labText.includes(query);

                    item.hidden = !matches;

                    if (matches) {
                        visibleProjects++;
                    }

                    if (projectName) {
                        highlightText(
                            projectName,
                            query
                        );
                    }
                });

                const labMatches =
                    !query ||
                    labText.includes(query) ||
                    visibleProjects > 0;

                lab.hidden = !labMatches;

                if (query && labMatches) {
                    lab.open = true;
                }

                if (labTitle) {
                    highlightText(
                        labTitle,
                        query
                    );
                }
            });
        });

        const activePanel =
            getActivePanel();

        if (activePanel) {
            anythingVisible =
                $$(
                    "details.lab:not([hidden])",
                    activePanel
                ).length > 0;
        }

        emptyState.hidden =
            anythingVisible;

        updateVisibleCounts();
    }


    function updateVisibleCounts() {
        semesterPanels.forEach((panel) => {
            const semesterTotal =
                $(".semester-total strong", panel);

            const visibleProjects =
                $$(".project-item", panel)
                    .filter((item) => !item.hidden)
                    .filter(
                        (item) =>
                            $(".project-open", item)
                    ).length;

            if (semesterTotal) {
                semesterTotal.textContent =
                    visibleProjects;
            }

            $$("details.lab", panel).forEach((lab) => {
                const visibleProjectCount =
                    $$(".project-item", lab)
                        .filter((item) => !item.hidden)
                        .filter(
                            (item) =>
                                $(".project-open", item)
                        ).length;

                const count =
                    $(".lab-count", lab);

                if (count) {
                    count.textContent =
                        `${visibleProjectCount} projects`;
                }
            });
        });
    }


    searchInput.addEventListener(
        "input",
        (event) => {
            applyFilter(event.target.value);
        }
    );


    // ------------------------------------
    // OPEN / CLOSE LABS
    // ------------------------------------

    openAllBtn.addEventListener("click", () => {
        const activePanel =
            getActivePanel();

        $$("details.lab", activePanel)
            .forEach((lab) => {
                if (!lab.hidden) {
                    lab.open = true;
                }
            });
    });


    closeAllBtn.addEventListener("click", () => {
        const activePanel =
            getActivePanel();

        $$("details.lab", activePanel)
            .forEach((lab) => {
                lab.open = false;
            });
    });


    // ------------------------------------
    // SEARCH SHORTCUT
    // ------------------------------------

    if (focusSearchBtn) {
        focusSearchBtn.addEventListener("click", () => {
            document
                .getElementById("archive")
                .scrollIntoView({
                    behavior: "smooth"
                });

            setTimeout(() => {
                searchInput.focus();
                searchInput.select();
            }, 450);
        });
    }


    document.addEventListener("keydown", (event) => {
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
            sourceModal.classList.contains("open")
        ) {
            closeSourceModal();
            return;
        }

        if (event.key === "Escape") {
            searchInput.value = "";
            applyFilter("");
            searchInput.blur();
        }
    });


    // ------------------------------------
    // SOURCE VIEWER
    // ------------------------------------

    $$(".code-button").forEach((button) => {
        button.addEventListener("click", () => {
            currentProject = {
                name: button.dataset.projectName,
                url: button.dataset.projectUrl
            };

            sourceProjectName.textContent =
                currentProject.name;

            activeSourceType = "html";

            setActiveSourceTab();
            openSourceModal();
            loadProjectSources();
        });
    });


    function openSourceModal() {
        sourceModal.classList.add("open");

        sourceModal.setAttribute(
            "aria-hidden",
            "false"
        );

        document.body.classList.add(
            "modal-open"
        );
    }


    function closeSourceModal() {
        sourceModal.classList.remove("open");

        sourceModal.setAttribute(
            "aria-hidden",
            "true"
        );

        document.body.classList.remove(
            "modal-open"
        );
    }


    $$("[data-close-modal]").forEach((element) => {
        element.addEventListener(
            "click",
            closeSourceModal
        );
    });


    sourceTabs.forEach((tab) => {
        tab.addEventListener("click", () => {
            activeSourceType =
                tab.dataset.sourceType;

            setActiveSourceTab();
            showActiveSource();
        });
    });


    function setActiveSourceTab() {
        sourceTabs.forEach((tab) => {
            tab.classList.toggle(
                "active",
                tab.dataset.sourceType ===
                    activeSourceType
            );
        });
    }


    async function loadProjectSources() {
        sourceFiles = {
            html: null,
            css: null,
            js: null
        };

        showLoadingMessage();

        const projectUrl =
            new URL(
                currentProject.url,
                window.location.href
            );

        try {
            const htmlResponse =
                await fetch(projectUrl.href);

            if (!htmlResponse.ok) {
                throw new Error(
                    "HTML file could not be loaded."
                );
            }

            const htmlText =
                await htmlResponse.text();

            sourceFiles.html = {
                path: currentProject.url,
                code: htmlText
            };

            const parser =
                new DOMParser();

            const projectDocument =
                parser.parseFromString(
                    htmlText,
                    "text/html"
                );

            await Promise.all([
                loadCssSource(
                    projectDocument,
                    projectUrl
                ),
                loadJsSource(
                    projectDocument,
                    projectUrl
                )
            ]);

            showActiveSource();
        } catch (error) {
            const message =
`Could not load this project's source.

Project:
${currentProject.url}

This viewer uses fetch(), so it works best when the archive is running through GitHub Pages.

Error:
${error.message}`;

            sourceFiles.html = {
                path: currentProject.url,
                code: message
            };

            sourceFiles.css = {
                path: "No stylesheet loaded",
                code:
                    "No CSS source could be loaded."
            };

            sourceFiles.js = {
                path: "No script loaded",
                code:
                    "No JavaScript source could be loaded."
            };

            showActiveSource();
        }
    }


    async function loadCssSource(
        projectDocument,
        projectUrl
    ) {
        const stylesheets =
            [
                ...projectDocument.querySelectorAll(
                    'link[rel="stylesheet"][href]'
                )
            ];

        const localStylesheet =
            stylesheets.find((link) => {
                const href =
                    link.getAttribute("href");

                return (
                    href &&
                    !href.startsWith("http://") &&
                    !href.startsWith("https://") &&
                    !href.startsWith("//")
                );
            });

        if (!localStylesheet) {
            sourceFiles.css = {
                path: "No local stylesheet found",
                code:
                    "This HTML file does not contain a local CSS stylesheet link."
            };

            return;
        }

        const cssPath =
            localStylesheet.getAttribute("href");

        const cssUrl =
            new URL(
                cssPath,
                projectUrl
            );

        try {
            const response =
                await fetch(cssUrl.href);

            if (!response.ok) {
                throw new Error();
            }

            sourceFiles.css = {
                path: cssUrl.pathname,
                code: await response.text()
            };
        } catch {
            sourceFiles.css = {
                path: cssUrl.pathname,
                code:
                    `The CSS file could not be loaded:\n${cssUrl.pathname}`
            };
        }
    }


    async function loadJsSource(
        projectDocument,
        projectUrl
    ) {
        const scripts =
            [
                ...projectDocument.querySelectorAll(
                    "script[src]"
                )
            ];

        const localScript =
            scripts.find((script) => {
                const src =
                    script.getAttribute("src");

                return (
                    src &&
                    !src.startsWith("http://") &&
                    !src.startsWith("https://") &&
                    !src.startsWith("//")
                );
            });

        if (!localScript) {
            sourceFiles.js = {
                path: "No local JavaScript found",
                code:
                    "This HTML file does not contain a local JavaScript file."
            };

            return;
        }

        const jsPath =
            localScript.getAttribute("src");

        const jsUrl =
            new URL(
                jsPath,
                projectUrl
            );

        try {
            const response =
                await fetch(jsUrl.href);

            if (!response.ok) {
                throw new Error();
            }

            sourceFiles.js = {
                path: jsUrl.pathname,
                code: await response.text()
            };
        } catch {
            sourceFiles.js = {
                path: jsUrl.pathname,
                code:
                    `The JavaScript file could not be loaded:\n${jsUrl.pathname}`
            };
        }
    }


    function showLoadingMessage() {
        sourcePath.textContent =
            currentProject.url;

        sourceCode.textContent =
            "Loading project source...";

        lineNumbers.textContent = "1";
    }


    function showActiveSource() {
        const file =
            sourceFiles[activeSourceType];

        if (!file) {
            sourcePath.textContent =
                "Loading...";

            sourceCode.textContent =
                "Loading source...";

            lineNumbers.textContent =
                "1";

            return;
        }

        sourcePath.textContent =
            file.path;

        sourceCode.textContent =
            file.code;

        updateLineNumbers(
            file.code
        );
    }


    function updateLineNumbers(code) {
        const amount =
            code.split("\n").length;

        lineNumbers.textContent =
            Array.from(
                {
                    length: amount
                },
                (_, index) =>
                    index + 1
            ).join("\n");
    }


    // ------------------------------------
    // COPY SOURCE
    // ------------------------------------

    copyCodeBtn.addEventListener(
        "click",
        async () => {
            const file =
                sourceFiles[activeSourceType];

            if (!file) {
                return;
            }

            try {
                await navigator.clipboard.writeText(
                    file.code
                );

                const originalText =
                    copyCodeBtn.textContent;

                copyCodeBtn.textContent =
                    "Copied";

                setTimeout(() => {
                    copyCodeBtn.textContent =
                        originalText;
                }, 1200);
            } catch {
                copyCodeBtn.textContent =
                    "Copy Failed";

                setTimeout(() => {
                    copyCodeBtn.textContent =
                        "Copy Code";
                }, 1200);
            }
        }
    );


    // ------------------------------------
    // INITIAL PAGE SETUP
    // ------------------------------------

    document.getElementById(
        "currentYear"
    ).textContent =
        new Date().getFullYear();

    updateVisibleCounts();
})();
