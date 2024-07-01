const fs = require('fs')
const path = require('path')
const algoliasearch = require('algoliasearch')
require('dotenv').config()

// Initialize Algolia client using environment variables
const client = algoliasearch(process.env.ALGOLIA_APPLICATION_ID, process.env.ALGOLIA_ADMIN_API_KEY)
const index = client.initIndex(process.env.ALGOLIA_INDEX)

// Function to read objects from a file
function readObjectsFromFile() {
  const filePath = path.join(__dirname, 'objects.json')
  
  try {
    const data = fs.readFileSync(filePath, 'utf8')
    const objects = JSON.parse(data)
    return objects
  } catch (error) {
    console.error('Error reading objects from file:', error)
    return []
  }
}

// Function to replace all objects in Algolia
async function replaceAllObjects(objects) {
  try {
    const response = await index.replaceAllObjects(objects, { autoGenerateObjectIDIfNotExist: true })
    console.log('Objects replaced successfully:', response)
  } catch (error) {
    console.error('Error replacing objects:', error)
  }
}

// Function to set custom ranking
async function setCustomRanking() {
  try {
    const settings = {
      searchableAttributes: [
        'title',
        'url',
        'breadcrumbs',
        'description'
      ],
      customRanking: [
        'asc(level)',
        'desc(title)',
        'desc(keywords)',
        'desc(description)',
        'desc(breadcrumbs)',
        'desc(url)'
      ]
    }

    const response = await index.setSettings(settings)
    console.log('Custom ranking set successfully:', response)
  } catch (error) {
    console.error('Error setting custom ranking:', error)
  }
}

// Main function to load objects from file, set ranking, and replace them in Algolia
async function main() {
  const objects = readObjectsFromFile()
  if (objects.length > 0) {
    await setCustomRanking()
    await replaceAllObjects(objects)
  } else {
    console.log('No objects to upload')
  }
}

main()
