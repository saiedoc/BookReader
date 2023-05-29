const electron = require('electron');
const { default: Epub, EpubCFI, Book } = require('epubjs');
let { ipcRenderer } = electron;

document.addEventListener("DOMContentLoaded", async function () {

    // resize window to a suitable size
    ipcRenderer.send('resize', 800, 600);

    // Init control elements
    const nextPageButton = document.getElementById("nextPageButton");
    const prevPageButton = document.getElementById("prevPageButton");
    const backButton = document.getElementById("viewer-back-button");
    const pageInput = document.getElementById("page-number");


    // 0 index for book name
    // 1 index for book file path
    // 2 index for book file extension
    let bookInfo;
    await ipcRenderer.invoke('get-opened-book-info').then(res => { bookInfo = res; });

    // Allow window resizing
    await ipcRenderer.invoke('modify-resizeable', true, 800, 600);

    // Set window title as book title
    const windowTitle = document.getElementById('windowTitle');
    windowTitle.style = "text-overflow: ellipsis;";
    windowTitle.textContent = bookInfo[0];

    // Book view container
    const container = document.getElementById('viewer-container');

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    if (bookInfo[2] === '.pdf') {
        // Load the PDF file
        pdfjsLib.getDocument(bookInfo[1]).promise.then(pdf => {

            let renderedPages = [];
            let currentPage = 1;
            let currentScale = 1;
            let canvas;

            function renderPage(pageNum) {

                pdf.getPage(pageNum).then(page => {
                    // Create a canvas element for the page
                    canvas = document.createElement('canvas');
                    canvas.style.display = 'block';

                    // Get the viewport of the page at 100% zoom
                    const viewport = page.getViewport({ scale: currentScale });

                    // Set the canvas dimensions to the viewport
                    canvas.width = viewport.width;
                    canvas.height = viewport.height;

                    // Render the page on the canvas
                    const renderContext = page.render({
                        canvasContext: canvas.getContext('2d'),
                        viewport: viewport
                    });

                    renderContext.promise.then(function () {
                        renderedPages[pageNum] = canvas;
                        if (pageNum === currentPage) {
                            container.appendChild(canvas);
                        }
                    });

                });
            }

            function goToPage(pageNumber, scale) {
                if (pageNumber >= 1 && pageNumber <= pdf.numPages) {
                    currentPage = pageNumber;
                    while (container.firstChild) {
                        container.removeChild(container.firstChild);
                    }
                    var canvas = renderedPages[currentPage];
                    if (canvas) {
                        container.appendChild(canvas);
                    } else {
                        renderPage(currentPage);
                    }
                }
            }

            goToPage(1, 1);

            // Button click function that turns to the next Page
            nextPageButton.addEventListener('click', () => {
                goToPage(currentPage + 1);
                blur();
            });

            // Button click function that turns to the prev Page
            prevPageButton.addEventListener('click', () => {
                goToPage(currentPage - 1);
                blur();
            });

            // Jump to page on page number input.
            pageInput.addEventListener('change', () => {
                goToPage(parseInt(pageInput.value));
            });

            // event function which allows scaling up or down book contents depending on wheel.
            document.addEventListener("wheel", function (e) {
                if (e.ctrlKey) {
                    var delta = e.deltaY > 0 ? -0.1 : 0.1; // calculate the zoom delta
                    setScale(delta);
                }
            });

            // function which sets the scale according to the wheel event functions
            function setScale(scale) {
                pdf.getPage(currentPage).then(page => {
                    while (container.firstChild) {
                        container.removeChild(container.firstChild);
                    }
                    currentScale += scale;
                    if (currentScale < 1)
                        currentScale = 1;
                    console.log(currentScale);
                    var viewport = page.getViewport({ scale: currentScale });
                    canvas.width = viewport.width;
                    canvas.height = viewport.height;
                    var context = canvas.getContext('2d');
                    var renderTask = page.render({
                        canvasContext: context,
                        viewport: viewport
                    });
                    renderTask.promise.then(function () {
                        container.appendChild(canvas);
                    });
                });
            }


        });

        //////////////////////////////////////////////////////////////////////////////////////////////////////

    } else if (bookInfo[2] === '.epub') {

        // disable page input
        let pageInput = document.getElementById("page-number");
        pageInput.style.display = "none";

        //load book
        let book = await ePub(bookInfo[1], { openAs: "epub" });

        book.loaded.navigation.then(function () {
            console.log("Book loaded");

            // Set the rendering options
            var renderingOptions = {
                width: "100%", height: "100%",
                flow: "scrolled",
            };

            // Render the book
            let rendition = book.renderTo("viewer-container", renderingOptions);
            console.log(rendition.display());

            // Handle errors
            book.on("error", function (error) {
                console.log("Epub.js error:", error);
            });

            // Button click function that turns to the next Page
            nextPageButton.addEventListener('click', () => {
                rendition.next();
                blur();
            });

            // Button click function that turns to the prev Page
            prevPageButton.addEventListener('click', () => {
                rendition.prev();
                blur();
            });


            // Add event listeners to the container element

            rendition.on("rendered", () => {

                let epubContainer = rendition.getContents();
                let currentFontSize = 100;

                // event function which allows scaling up or down book contents depending on wheel.
                document.addEventListener("wheel", function (e) {
                    if (e.ctrlKey) {
                        let delta = Math.sign(e.deltaY);
                        currentFontSize += delta * 10;
                        if (currentFontSize < 50) {
                            currentFontSize = 50;
                        } else if (currentFontSize > 200) {
                            currentFontSize = 200;
                        }
                        for (let i = 0; i < epubContainer.length; i++) {
                            let content = epubContainer[i];
                            let html = content.document.querySelector("html");
                            html.style.fontSize = currentFontSize + "%";
                        }
                    }
                });

            });


            // Get book navigation "chapters index"
            let chapters = book.navigation.toc;
            let selectElement = document.getElementById("chapter-dropdown");

            function buildToc(options, tocItems) {
                tocItems.forEach(function (item) {
                    var option = document.createElement("option");
                    option.value = item.href;
                    option.text = item.label;
                    options.appendChild(option);
                    if (item.subitems.length > 0) {
                        var optgroup = document.createElement("optgroup");
                        optgroup.label = item.label;
                        options.appendChild(optgroup);
                        buildToc(optgroup, item.subitems);
                    }
                });
            }

            // Populate the chapter dropdown
            buildToc(selectElement, chapters);

            // The event function which jumps to the book chapter
            selectElement.addEventListener("change", function () {
                var href = this.value;
                rendition.display(href);
            });

        });

    }

    // Event function to go back to the Library Interface
    backButton.addEventListener('click', async (event) => {
        await ipcRenderer.invoke('modify-resizeable', false, 0, 0);
        window.location.href = "./MainInterface.html";
    });

});