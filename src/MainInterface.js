const electron = require('electron');
const { dialog } = require('electron');
let { ipcRenderer } = electron;

document.addEventListener("DOMContentLoaded", async function () {

    // resize window to a suitable size
    ipcRenderer.send('resize', 800, 600);


    // define dynamic HTML control elements 
    const addButton = document.getElementById('addButton');
    const openButton = document.getElementById('bookOpenButton');
    const removeButton = document.getElementById('bookRemoveButton');
    const searchBackButton = document.getElementById('searchBackButton');
    const searchBackButtonIcon = document.getElementById('searchBackIcon');
    const searchBar = document.getElementById('searchBar');
    const bookName = document.getElementById('bookName');
    const bookAuthorName = document.getElementById('bookAuthorName');
    const bookCategory = document.getElementById('bookCategory');
    const bookDescription = document.getElementById('bookDescription');
    const bookCoverImage = document.getElementById('bookCoverImage');
    const bookDescriptionLabel = document.getElementById('bookDescriptionLabel');
    let bookList = document.getElementById('BookList');
    let selectedBookPath;


    // Load the book library from the local JSON-File
    let myData = await ipcRenderer.invoke('load-book-library');

    // populate book list "HTML ul" from JSON-list
    function populateBookLibrary() {
        myData.forEach(element => {

            const li = document.createElement('li');
            const btn = document.createElement('button');

            btn.className = 'btn btn-secondary btn-sm font-weight-bold bookListElement';
            btn.textContent = element.bookName;

            btn.addEventListener('click', () => {

                removeButton.style.display = 'block';
                openButton.style.display = 'block';
                bookName.textContent = element.bookName;
                bookAuthorName.textContent = element.bookAuthorName;
                bookCategory.textContent = element.bookCategory;
                bookDescription.textContent = element.bookDescription;
                selectedBookPath = element.bookFilePath;
                bookCoverImage.src = element.bookCover;
                bookCoverImage.style.display = 'block';
                bookDescriptionLabel.textContent = 'Book Description:';


            });

            li.appendChild(btn);
            bookList.appendChild(btn);

        });
    };

    populateBookLibrary();

    // Search bar hide or view functionality 
    searchBackButton.addEventListener('click', () => {
        if (searchBackButtonIcon.className === 'fa fa-search') {
            searchBackButtonIcon.className = 'fa fa-times';
            document.getElementById('sidePaneLabel').style.display = 'none';
            addButton.style.display = 'none';
            searchBar.style.width = '100px';
            searchBar.style.display = 'block';

        } else {
            searchBar.style.display = 'none';
            searchBackButtonIcon.className = 'fa fa-search';
            document.getElementById('sidePaneLabel').style.display = 'block';
            addButton.style.display = 'block';
            Array.from(bookList.children).forEach(book => {
                book.style.display = 'block';
            });

        }


    });

    // Fliter according to the Searchbar function
    function libraryFilter() {
        Array.from(bookList.children).forEach(book => {
            if (book.textContent.toLowerCase().includes(searchBar.value.toLowerCase()))
                book.style.display = 'block';
            else
                book.style.display = 'none';
        });
    }

    // Search book by name functionality
    searchBar.addEventListener('input', () => {
        libraryFilter();
    });

    // Add book from file path functionality
    addButton.addEventListener('click', async () => {
        const result = await ipcRenderer.invoke('open-file-dialog');
        const bookMetaData = await ipcRenderer.invoke('generate-book-metadata', result);
        myData.push(bookMetaData);
        bookList.innerHTML = '';
        populateBookLibrary();
    });

    // sends a 'write books to json' invoke to the main process before closing the window
    window.addEventListener('beforeunload', (event) => {
        ipcRenderer.invoke('write-book-library', myData);
    });

    // Remove a book from the library event function
    removeButton.addEventListener('click', (event) => {
        Array.from(bookList.children).forEach(book => {
            if (book.textContent === bookName.textContent) {
                myData = myData.filter(bookJsonElement => bookJsonElement.bookName !== bookName.textContent);
            }
        });
        bookList.innerHTML = '';
        populateBookLibrary();
        libraryFilter();
        bookName.textContent = '';
        bookAuthorName.textContent = '';
        bookCategory.textContent = '';
        bookDescription.textContent = '';
        bookDescriptionLabel.textContent = '';
        removeButton.style.display = 'none';
        openButton.style.display = 'none';
        bookCoverImage.style.display = 'none';
    });

    // Open a book from the library event

    openButton.addEventListener('click', (event) => {
        ipcRenderer.invoke("open-book", bookName.textContent, selectedBookPath);
        window.location.href = "./viewer.html";
    });



});