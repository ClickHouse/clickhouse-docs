import * as fs from 'fs'
const jsonToTable = (jsonData) => {
  if (!Array.isArray(jsonData) || jsonData.length === 0) {
    return "";
  }

  const headers = Object.keys(jsonData[0]);
  const headerRow = `| ${headers.join(' | ')} |\n`;
  const separatorRow = `| ${headers.map(() => '---').join(' | ')} |\n`;

  const rows = jsonData.map(obj => `| ${headers.map(key => obj[key] || '').join(' | ')} |`);

  return `\n${headerRow}${separatorRow}${rows.join('\n')}\n`;
}

const insertTextBetweenTags = (filePath, textToInsert, startTag, endTag) => {
  try {
    const fileContent = fs.readFileSync(filePath, 'utf-8');

    const startIndex = fileContent.indexOf(startTag) + startTag.length;
    const endIndex = fileContent.indexOf(endTag);

    if (startIndex === -1 || endIndex === -1) {
      console.error(`Error: Tags "${startTag}" or "${endTag}" not found in the file.`);
      return;
    }

    const newContent =
      fileContent.substring(0, startIndex) +
      textToInsert +
      fileContent.substring(endIndex);

    fs.writeFileSync(filePath, newContent, 'utf-8');
    console.log('Text inserted successfully.');

  } catch (err) {
    console.error(`Error: ${err}`);
  }
}

export {jsonToTable, insertTextBetweenTags}