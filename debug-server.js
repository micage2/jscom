const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

if (!process.argv[2]) {
    process.kill();
}
const file = process.argv[2]; // Pass ${relativeFile} here
if (!file) throw new Error('Missing file path');

const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>JSCOM</title>
    <link href="../src/app.css" rel="stylesheet">
</head>
<body>
    <script src="https://cdn.jsdelivr.net/npm/path-data-polyfill@latest/path-data-polyfill.js"></script>
    <script type="module" src="../${file.replace(/\\/g, '/')}" ></script>
</body>
</html>`;
fs.writeFileSync('.temp/index.html', html);

// spawn('npx', ['serve', '.', '-l', '5500'], { shell: true, detached: true })
//   .unref(); // Detach to let the server run in background
