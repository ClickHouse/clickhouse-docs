const axios = require('axios');
const fs = require('fs');

const apiEndpoint = 'https://api.clickhouse.cloud/v1';

async function fetchOpenAPISpec() {
  try {
    const response = await axios.get(apiEndpoint);
    return response.data;
  } catch (error) {
    console.error(error);
    return null;
  }
}

function groupEndpointsByPrefix(spec) {
  const groupedEndpoints = {};

  for (const path in spec.paths) {
    for (const method in spec.paths[path]) {
      let prefix = path.split('/')[4];
      
      if (!prefix || prefix === 'activities') {
        prefix = 'organizations'
      }

      if (!groupedEndpoints[prefix]) {
        groupedEndpoints[prefix] = {};
      }

      if (!groupedEndpoints[prefix][path]) {
        groupedEndpoints[prefix][path] = {};
      }

      groupedEndpoints[prefix][path][method] = spec.paths[path][method];
    }
  }

  return groupedEndpoints;
}

function generateDocusaurusMarkdown(spec, groupedEndpoints, prefix) {
  let markdownContent = `---\nsidebar_label: ${prefix.charAt(0).toUpperCase() + prefix.slice(1)}\n---\n`;

  for (const path in groupedEndpoints) {
    for (const method in groupedEndpoints[path]) {
      const operation = groupedEndpoints[path][method];

      markdownContent += `\n## ${operation.summary}\n\n`;
      markdownContent += `${operation.description}\n\n`;

      markdownContent += `| Method | Path |\n`
      markdownContent += `| :----- | :--- |\n`
      markdownContent += `| ${method.toUpperCase()} | ${path} |\n\n`

      markdownContent += `### Request\n\n`;
  
      if (operation.parameters && operation.parameters.length > 0) {
        markdownContent += `#### Path Params\n\n`;

        markdownContent += `| Name | Type | Description |\n`
        markdownContent += `| :--- | :--- | :---------- |\n`

        for (const parameter of operation.parameters) {
          markdownContent += `| ${parameter.name} | ${parameter.schema.format || parameter.schema.type || ''} | ${parameter.description || ''} | \n`
        }

        markdownContent += '\n'
      }

      if (operation.requestBody) {
        markdownContent += `### Body Params\n\n`;

        const schema = operation.requestBody.content["application/json"].schema['$ref'].split('/').pop()
        const bodyParamAttrs = spec.components.schemas[schema].properties
        const bodyParams = Object.keys(bodyParamAttrs)

        markdownContent += `| Name | Type | Description |\n`
        markdownContent += `| :--- | :--- | :---------- |\n`

        for (const parameter of bodyParams) {  
          markdownContent += `| ${parameter} | ${bodyParamAttrs[parameter].type || bodyParamAttrs[parameter].format || ''} | ${bodyParamAttrs[parameter].description || ''} | \n`
        }
      }

      if (operation.responses) {
        markdownContent += `\n### Response\n\n`;

        markdownContent += `#### Response Schema\n\n`;
        
        const schema = operation.responses['200'].content["application/json"].schema['$ref'].split('/').pop()
        const bodyParamAttrs = spec.components.schemas[schema].properties
        const bodyParams = Object.keys(bodyParamAttrs)
        const sampleResponseObj = {}

        markdownContent += `| Name | Type | Description |\n`
        markdownContent += `| :--- | :--- | :---------- |\n`

        for (const parameter of bodyParams) {
          const paramType = bodyParamAttrs[parameter].format || bodyParamAttrs[parameter].type
          markdownContent += `| ${parameter} | ${paramType || ''} | ${bodyParamAttrs[parameter].description || ''} | \n`
          
          switch (paramType) {
            case 'uuid':
              sampleResponseObj[parameter] = 'uuid';
              break;
            case 'string':
              sampleResponseObj[parameter] = 'string';
              break;
            case 'number':
              sampleResponseObj[parameter] = 0;
              break;
            case 'array':
              sampleResponseObj[parameter] = 'Array';
              break;
            case 'boolean':
              sampleResponseObj[parameter] = 'boolean';
              break;
            case 'date-time':
              sampleResponseObj[parameter] = 'date-time';
              break;
            case 'email':
              sampleResponseObj[parameter] = 'email';
              break;
          }
        }

        markdownContent += `\n#### Sample response\n\n`;
        markdownContent += '```\n'
        markdownContent += `${JSON.stringify(sampleResponseObj, 0, 2)}`
        markdownContent += '\n```\n'
      }
    }
  }

  return markdownContent;
}

async function main() {
  const openAPISpec = await fetchOpenAPISpec();

  if (!openAPISpec) {
    console.error('Error fetching OpenAPI spec.');
    return;
  }

  const groupedEndpoints = groupEndpointsByPrefix(openAPISpec);

  for (const prefix in groupedEndpoints) {
    const markdownContent = generateDocusaurusMarkdown(openAPISpec, groupedEndpoints[prefix], prefix);
    fs.writeFileSync(`docs/en/cloud/manage/api/${prefix}-api-reference.md`, markdownContent);
  }

  console.log('Markdown files generated successfully.');
}

main();
