const fs = require('fs');
const path = require('path');

const jsonFilePath = path.join(__dirname, 'id_slug_mapping.json');
const mapping = JSON.parse(fs.readFileSync(jsonFilePath, 'utf8'));

let stringsArray = [
    "/en/integrations/clickpipes/kafka",
    "/en/integrations/clickpipes",
    "/en/integrations/clickpipes/kafka",
    "/en/integrations/clickpipes/kinesis",
    "/en/integrations/clickpipes/object-storage",
    "/en/integrations/clickpipes/postgres",
    "en/integrations/clickpipes/secure-kinesis",
];

// Function to replace strings based on the mapping
function applyMapping(content, mapping) {
    console.log(content)
    const newContent = mapping[content]
        || mapping[removePrefixSlash(content)]
        || mapping['/' + content]
        || mapping[content + '/'];
    
    // console.log(newContent)
    
    if (!newContent) {
        console.log(`No mapping found for: ${content}`);
        return wrapWithQuotesAndTrailingComma(content);
    }

    return wrapWithQuotesAndTrailingComma(newContent)
}

function removePrefixSlash(str) {
    if (str.startsWith('/')) {
        return str.slice(1); // Remove the first character if it's a '/'
    }

    return str; // Return the string unchanged if there's no prefix slash
}

const wrapWithQuotesAndTrailingComma = (str) => `"${str}",`;


// console.log(mapping)

// Apply the mapping to each string in the array
let updatedArray = stringsArray.map(str => applyMapping(str, mapping));

// console.log(updatedArray)

// Join the array into a single string with newlines
let updatedContent = updatedArray.join('\n');

// console.log(updatedContent)

// Write the updated content to a new file
const outputFilePath = path.join(__dirname, 'outputFile.txt');
fs.writeFileSync(outputFilePath, updatedContent, 'utf8');

console.log(`Mapping applied successfully. Output written to ${outputFilePath}`);
