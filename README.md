# BookReader

**BookReader** is a versatile book reading and eLibrary application that allows you to read eBooks in various formats like EPUB and PDF, and manage your personal library. It includes features like simple natural language processing for better search and integration with Google Books.

## Features

- Support for EPUB and PDF formats
- eLibrary management with search capabilities
- Integration with Google Books API for fetching book information
- Cross-platform compatibility using Electron

## Getting Started

### Prerequisites

- **Node.js** and **npm** should be installed on your machine. You can download them from [Node.js official website](https://nodejs.org/).

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/saiedoc/BookReader.git
   ```
2. Navigate to the project directory:
   ```bash
   cd bookreader
   ```
3. Install the necessary dependencies:
   ```bash
   npm install
   ```

### Running the Application

To start the application in development mode with hot reloading, use:

```bash
npm run dev
```

This command will watch for changes in `main.js`, `.html`, and `.css` files and reload the Electron app automatically.

To start the application in production mode:

```bash
npm start
```

## Project Structure

- **main.js**: The main entry point of the Electron application.
- **package.json**: Project configuration, including dependencies and scripts.
- **/src**: Source files for the application.
- **/assets**: Static assets such as images, icons, etc.

## Dependencies

The project is built using the following key libraries:

- **[Electron](https://www.electronjs.org/)**: Used for building cross-platform desktop apps with web technologies.
- **[epubjs](https://github.com/futurepress/epub.js/)**: A JavaScript library for reading EPUB files.
- **[pdfjs-dist](https://github.com/mozilla/pdfjs-dist)**: A library for rendering PDFs.
- **[google-books-search](https://github.com/eykrehbein/google-books-search)**: A library for searching books using Google Books API.
- **[jquery](https://jquery.com/)**: A fast, small, and feature-rich JavaScript library.
- **[natural](https://github.com/NaturalNode/natural)**: A general natural language facility for Node.js.
- **[jszip](https://github.com/Stuk/jszip)** & **[jszip-utils](https://github.com/Stuk/jszip-utils)**: Libraries for creating, reading, and editing .zip files.
- **[readium-js-viewer](https://github.com/readium/readium-js-viewer)**: A library for viewing EPUB files.

## Development Dependencies

- **[nodemon](https://nodemon.io/)**: Automatically restarts the application when file changes are detected.

## Author

**Saied Aussi**

## License

This project is licensed under the ISC License.
