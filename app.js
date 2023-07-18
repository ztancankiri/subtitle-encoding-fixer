const fs = require("fs");
const path = require("path");
const chardet = require("chardet");
const iconv = require("iconv-lite");

function detectEncoding(filePath) {
	const encoding = chardet.detectFileSync(filePath);

	if (encoding === "UTF-8") {
		const fileData = fs.readFileSync(filePath);

		if (fileData[0] === 0xef && fileData[1] === 0xbb && fileData[2] === 0xbf) {
			return "UTF-8-BOM";
		} else {
			return "UTF-8";
		}
	} else {
		return encoding;
	}
}

function convertToUTF8BOM(filePath) {
	const bomPrefix = "\ufeff";
	const targetEncoding = "UTF-8";

	const fileData = fs.readFileSync(filePath);
	const encoding = chardet.detectFileSync(filePath);
	const fileContent = iconv.decode(fileData, encoding);

	const encodedContent = iconv.encode(fileContent, targetEncoding).toString();
	const resultContent = `${bomPrefix}${encodedContent}`;

	fs.writeFileSync(filePath, resultContent, { encoding: targetEncoding });
}

function isDirectory(path) {
	try {
		const stats = fs.statSync(path);
		return stats.isDirectory();
	} catch (error) {
		console.error("Error checking if path is a directory:", error);
		return false;
	}
}

function convertToUTF8BOMBatch(folderPath) {
	const files = fs.readdirSync(folderPath).map((item) => path.join(folderPath, item));

	for (const file of files) {
		if (isDirectory(file)) {
			convertToUTF8BOMBatch(file);
		} else {
			if (file.endsWith(".srt")) {
				const previousEncoding = detectEncoding(file);
				convertToUTF8BOM(file);
				const currentEncoding = detectEncoding(file);

				console.log(`File: ${file}, Previous Encoding: ${previousEncoding}, Current Encoding: ${currentEncoding}`);
			}
		}
	}
}

if (process.argv.length === 3) {
	convertToUTF8BOMBatch(process.argv[2]);
} else {
	console.log("The root directory path is required as an argument.");
}
