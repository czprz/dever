module.exports = {
    createFolder: createFolder,
    downloadFile: downloadFile
}

const fs = require('fs');
const http = require('http');

/**
 * Create directory
 * @param dest
 */
function createFolder(dest) {
    if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest);
    }
}

/**
 * Download file
 * @param url
 * @param dest
 * @param callback
 */
function downloadFile(url, dest, callback) {
    const file = fs.createWriteStream(dest);

    http.get(url, function (response) {
        response.pipe(file);
        file.on('finish', function () {
            file.close(callback);  // close() is async, call cb after close completes.
        });
    }).on('error', function (err) { // Handle errors
        fs.unlink(dest); // Delete the file async. (But we don't check the result)
        if (callback) {
            callback(err.message);
        }
    });
}