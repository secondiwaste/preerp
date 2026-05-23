#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

// Get source folder and output file from command line arguments
const sourceFolder = process.argv[2];
const outputFile = process.argv[3];

if (!sourceFolder || !outputFile) {
  console.error('Usage: node create-release-archive.js <source-folder> <output-file>');
  console.error('Example: node create-release-archive.js release/preerp-1-20240523 release/preerp-1-20240523.zip');
  process.exit(1);
}

// Resolve absolute paths
const sourcePath = path.resolve(sourceFolder);
const outputPath = path.resolve(outputFile);

// Check if source folder exists
if (!fs.existsSync(sourcePath)) {
  console.error(`Error: Source folder does not exist: ${sourcePath}`);
  process.exit(1);
}

// Create output directory if it doesn't exist
const outputDir = path.dirname(outputPath);
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Create a file to stream archive data to
const output = fs.createWriteStream(outputPath);
const archive = archiver('zip', {
  zlib: { level: 9 } // Maximum compression
});

// Listen for all archive data to be written
output.on('close', function() {
  const sizeInMB = (archive.pointer() / 1024 / 1024).toFixed(2);
  console.log(`✓ Archive created successfully: ${outputPath}`);
  console.log(`✓ Total size: ${sizeInMB} MB (${archive.pointer()} bytes)`);
});

// Handle warnings (e.g. stat failures and other non-blocking errors)
archive.on('warning', function(err) {
  if (err.code === 'ENOENT') {
    console.warn('Warning:', err);
  } else {
    throw err;
  }
});

// Handle errors
archive.on('error', function(err) {
  console.error('Error creating archive:', err);
  throw err;
});

// Pipe archive data to the output file
archive.pipe(output);

// Get the folder name to preserve directory structure in the zip
const folderName = path.basename(sourcePath);
console.log(`Creating archive: ${outputPath}`);
console.log(`Source folder: ${sourcePath}`);

// Append files from the source folder, maintaining the folder structure
archive.directory(sourcePath, folderName);

// Finalize the archive (i.e., finish writing)
archive.finalize();
