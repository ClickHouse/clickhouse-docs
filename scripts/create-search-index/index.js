const fs = require('fs')
const path = require('path')
const matter = require('gray-matter')
const marked = require('marked')

function findMarkdownFiles(directory, fileList = []) {
  const files = fs.readdirSync(directory)

  files.forEach(file => {
    const filePath = path.join(directory, file)
    const stat = fs.statSync(filePath)

    if (stat.isDirectory()) {
      if (
        path.basename(filePath).startsWith('_') ||
        filePath.includes('/en/whats-new') ||
        filePath.includes('/docs/zh') ||
        filePath.includes('/docs/ru')
      ) {
        // Ignore folders that begin with "_", the "/en/whats-new" folder, "/docs/zh", and "/docs/ru"
        return
      }

      findMarkdownFiles(filePath, fileList)
    } else if (path.extname(file) === '.md') {
      fileList.push(filePath)
    }
  })

  return fileList
}

function parseFrontmatter(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8')
  const { data } = matter(content)
  const title = data.sidebar_label || ''
  const description = truncateDescription(data.description || '')
  const keywords = data.keywords ? [data.keywords] : []
  const slug = data.slug || ''

  return { title, description, keywords, slug, content: matter(content).content }
}

function truncateFilePath(filePath) {
  const index = filePath.indexOf('clickhouse-docs')
  let truncatedPath = index !== -1 ? filePath.substring(index + 'clickhouse-docs'.length) : filePath
  if (truncatedPath.endsWith('.md')) {
    truncatedPath = truncatedPath.slice(0, -3) // Remove the ".md" extension
  }
  return truncatedPath
}

function createAnchorLink(heading) {
  return heading
    .toLowerCase()
    .replace(/[^\w]+/g, '-')
    .replace(/^-+|-+$/g, '') // Remove preceding and trailing dashes
}

function cleanDescriptionContent(content) {
  return content
    .replace(/```[\s\S]*?```/g, '') // Remove text inside triple backticks
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/{[^}]*}/g, '') // Remove text inside curly braces
    .replace(/\*[^*]*\*/g, '') // Remove text inside asterisks
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Extract text from links
    .replace(/^\s*\d+\.\s*/, '') // Remove ordered list markers (e.g., "1. ")
    .replace(/^\s*[\*\-]\s*/, '') // Remove unordered list markers (e.g., "* " or "- ")
    .replace(/:::note\n/g, '') // Remove ":::note\n"
    .replace(/:::tip\n/g, '') // Remove ":::tip\n"
    .replace(/https?:\/\/[^\s]+/g, '') // Remove URLs
    .replace(/^\|.*\|$/gm, '') // Remove markdown tables
}

function cleanTitle(title) {
  return title
    .replace(/^\s*\d+\.\s*/, '') // Remove numbers at the beginning of the title (e.g., "4. Perform Joins" -> "Perform Joins")
    .replace(/{[^}]*}/g, '')
    .trim()
}

function truncateDescription(description) {
    if (description.length > 80) {
      return description.substring(0, 77).trim() + '...'
    }
    return description.trim()
}

function parseHeadings(content, baseUrl) {
    const tokens = marked.lexer(content)
    const results = []
    let descriptionContent = ''

    tokens.forEach((token, index) => {
      if (token.type === 'heading') {
        const title = cleanTitle(token.text)
        const anchorLink = createAnchorLink(title)
        const url = `${baseUrl}#${anchorLink}`
        const level = token.depth // Use the heading depth as the level

        // Find the next token that is not a heading to use as description content
        let description = ''
        for (let i = index + 1; i < tokens.length; i++) {
          if (tokens[i].type === 'code') {
            // Ignore content inside triple backticks
            continue
          }
          if (tokens[i].type === 'table') {
            // Ignore content inside markdown tables
            continue
          }
          if (tokens[i].type !== 'heading') {
            descriptionContent = tokens[i].raw
            break
          }
        }

        // Clean the description content, truncate to the first 80 characters, and trim whitespace
        description = truncateDescription(cleanDescriptionContent(descriptionContent))

        results.push({
          url: url,
          title: title,
          description: description,
          keywords: [],
          level: level,
          breadcrumbs: generateBreadcrumbs(baseUrl)
        })
      }
  })

  return results
}

function generateBreadcrumbs(url) {
  const specialWords = ['sql', 'json', 'jdbc', 'api']
  const parts = url.split('/').filter(part => part && !part.startsWith('#') && part !== 'en')
  const breadcrumbs = parts.map(part => {
      let formattedPart = part.replace(/-/g, ' ').replace(/_/g, ' ')
      specialWords.forEach(word => {
          const regex = new RegExp(`\\b${word}\\b`, 'gi')
          formattedPart = formattedPart.replace(regex, word.toUpperCase())
      })
      formattedPart = formattedPart.replace(/^\w/, c => c.toUpperCase())
      return formattedPart
  })
  return breadcrumbs.join(' > ')
}

function deduplicateObjects(objects) {
  const seen = new Map()
  return objects.filter(obj => {
      const key = `${obj.title}-${obj.url}`
      if (seen.has(key)) {
          return false
      }
      seen.set(key, true)
      return true
  })
}

const docsDirectory = path.resolve(__dirname, '../../docs') // Set to "../../docs"
const markdownFiles = findMarkdownFiles(docsDirectory)

let results = []

markdownFiles.forEach(filePath => {
  const { title, description, keywords, slug, content } = parseFrontmatter(filePath)
  const truncatedFilePath = truncateFilePath(filePath)
  const baseUrl = slug ? slug : truncatedFilePath

  // Add top-level page object
  results.push({
      url: baseUrl,
      title: title,
      description: description,
      keywords: keywords,
      level: 0, // Top-level pages have level 0
      breadcrumbs: generateBreadcrumbs(baseUrl)
  })

  // Add heading objects
  results = results.concat(parseHeadings(content, baseUrl))
})

results = deduplicateObjects(results)

fs.writeFileSync('objects.json', JSON.stringify(results, null, 2), 'utf-8')
console.log('Results written to objects.json')
console.log(`Total number of objects created: ${results.length}`)
