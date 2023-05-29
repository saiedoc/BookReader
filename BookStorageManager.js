const { Console } = require('console');
const fs = require('fs');


// Function that reads the book list "library" from the local books.json file
function readFromJson() {
    const rawData = fs.readFileSync('src/Resources/books.json');
    const data = JSON.parse(rawData);
    return data;
}

// Function that writes the book list "library" to the local books.json file
function writeToJson(data) {
    fs.writeFile('src/Resources/books.json', JSON.stringify(data), err => {
        if (err) throw err;
        console.log("Book library written to File");
    });
}

module.exports = { readFromJson, writeToJson }

