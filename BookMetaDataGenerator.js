const googleBooks = require('google-books-search');
const path = require('path');
const natural = require('natural');
const { v4 } = require('uuid');

function generateBookMetaData(bookFilePath) {
    return new Promise((resolve, reject) => {

        // get the filename from the filepath in order to send it as google books search query
        const fileNameWithExtension = path.basename(bookFilePath[0]);
        const extension = path.extname(bookFilePath[0]);
        const fileNameWithoutExtension = fileNameWithExtension.slice(0, -extension.length);


        // initialize book metadata variable
        let bookMetaData = {
            bookName: fileNameWithoutExtension,
            bookAuthorName: 'No Info',
            bookCategory: 'No Info',
            bookDescription: 'Problem loading book information or No Results found online!',
            bookCover: '',
            bookId: v4(),
            bookFilePath: bookFilePath[0]
        };

        // Function which calculate the similarities between two string and returns true if the they are more
        // than 50% similarity. 
        function similarity(string1, string2) {
            const bigrams1 = getBigrams(string1);
            const bigrams2 = getBigrams(string2);

            const intersection = bigrams1.filter(bigram => bigrams2.includes(bigram));
            const similarity = (2 * intersection.length) / (bigrams1.length + bigrams2.length);
            if (similarity < 0.4)
                return false;
            else
                return true;
        }

        // Function needed by the similarity function's algorithm (it gets bigrams from string and in this case its every adjacent two letters of the string)
        function getBigrams(string) {
            const bigrams = [];
            for (let i = 0; i < string.length - 1; i++) {
                bigrams.push(string.slice(i, i + 2));
            }
            return bigrams;
        }

        // Execute the search query to get the book info
        googleBooks.search(fileNameWithoutExtension, async (error, results) => {
            if (error) {
                console.log(error);
                reject(error);
            } else if (results.length === 0) {
                console.log('No results found.');
                resolve(bookMetaData);
            }
            else {
                if (similarity(fileNameWithoutExtension, results[0].title)) {
                    bookMetaData.bookName = results[0].title;
                    bookMetaData.bookAuthorName = results[0].authors[0];
                    bookMetaData.bookCategory = results[0].categories[0];
                    bookMetaData.bookDescription = results[0].description;
                    bookMetaData.bookCover = results[0].thumbnail;
                }
                resolve(bookMetaData);
            }
        });
    });
}

module.exports = { generateBookMetaData };