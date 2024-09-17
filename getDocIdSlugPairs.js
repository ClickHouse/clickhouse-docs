const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const docsDir = path.join(__dirname, 'docs');
const outputFilePath = path.join(__dirname, 'id_slug_mapping.json');

function getAllMarkdownFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);

    files.forEach((file) => {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
            getAllMarkdownFiles(filePath, fileList);
        } else if (file.endsWith('.md') || file.endsWith('.mdx')) {
            fileList.push(filePath);
        }
    });

    return fileList;
}

function getSlugFromFrontMatter(filePath) {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const frontMatter = matter(fileContent);
    
    let slug = frontMatter.data.slug || null;
    return removeMarkdownExtension(slug);
}

function removeMarkdownExtension(filePath) {
    if (!filePath) return ''

    if (filePath.endsWith('.md')) {
        return filePath.slice(0, -3); // Remove the last 3 characters (".md")
    } else if (filePath.endsWith('.mdx')) {
        return filePath.slice(0, -4); // Remove the last 4 characters (".mdx")
    }

    return filePath
}

function removeTrailingSlash(str) {
    if (str.endsWith('/')) {
        return str.slice(0, -1);
    }

    return str;
}

function createIdSlugMapping() {
    const markdownFiles = getAllMarkdownFiles(docsDir);
    const idSlugMapping = {};

    markdownFiles.forEach((file) => {
        const relativeFilePath = removeTrailingSlash(
            removeMarkdownExtension(path.relative(docsDir, file)));
        const slug = getSlugFromFrontMatter(file);
        if (slug) {
            idSlugMapping[slug] = relativeFilePath;
        } else {
            idSlugMapping[relativeFilePath] = relativeFilePath;
        }
    });

    return idSlugMapping;
}

function saveMappingToFile(mapping) {
    fs.writeFileSync(outputFilePath, JSON.stringify(mapping, null, 2), 'utf8');
    console.log(`Mapping saved to ${outputFilePath}`);
}

const mapping = createIdSlugMapping();
saveMappingToFile(mapping);
