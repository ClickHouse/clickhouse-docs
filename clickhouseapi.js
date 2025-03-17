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
  let markdownContent = `---\nsidebar_label: '${prefix.charAt(0).toUpperCase() + prefix.slice(1)}'\n`;
  markdownContent += `title: '${prefix.charAt(0).toUpperCase() + prefix.slice(1)}'\n`;
  markdownContent += `slug: /cloud/manage/api/${prefix}-api-reference\n`;
  markdownContent += `description: 'Cloud API reference documentation for ${prefix}'\n---\n`;

  for (const path in groupedEndpoints) {
    for (const method in groupedEndpoints[path]) {
      const operation = groupedEndpoints[path][method];

      markdownContent += `\n## ${operation.summary}\n\n`;
      markdownContent += `${operation.description}\n\n`;

      markdownContent += `| Method | Path |\n`
      markdownContent += `| :----- | :--- |\n`
      markdownContent += `| ${method.toUpperCase()} | \`${path}\` |\n\n`

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

      if (operation.responses && operation.responses['200'].content["application/json"]) {
        const rawSchema = operation.responses['200'].content["application/json"].schema
        const result = rawSchema.properties.result
        
        if (result) {
          markdownContent += `\n### Response\n\n`;

          markdownContent += `#### Response Schema\n\n`;

          const schema = rawSchema.properties.result.type === 'array' ?
            result.items['$ref'].split('/').pop() : result['$ref'].split('/').pop()

          const extractedFields = extractFields(result, spec.components.schemas, undefined);
          markdownContent += `| Name | Type | Description |\n`
          markdownContent += `| :--- | :--- | :---------- |\n`
          markdownContent += extractedFields.markdown
          markdownContent += '\n'
          markdownContent += `\n#### Sample response\n\n`;
          markdownContent += '```\n'
          markdownContent += `${JSON.stringify(extractedFields.json, 0, 2)}`
          markdownContent += '\n```\n'
      }
    }
    }
  }

  return markdownContent;
}

function extractFields(result, schemas, fieldPrefix) {
  const schemaRef = result.type === 'array' ? result.items['$ref'].split('/').pop() : result['$ref'].split('/').pop();
  const bodyParamAttrs = schemas[schemaRef].properties;
  const bodyParams = Object.keys(bodyParamAttrs);
  const resObj = {
    markdown: '',
    json: {}
  }
  for (const parameter of bodyParams) {
      const newPrefix = fieldPrefix ? `${fieldPrefix}.${parameter}` : parameter;
    if (bodyParamAttrs[parameter]['$ref']) {
  
      const nestedObj = extractFields(bodyParamAttrs[parameter], schemas, newPrefix)
      resObj.markdown += nestedObj.markdown
      resObj.json[parameter] = nestedObj.json
    }
    else {
      const paramType = bodyParamAttrs[parameter].format || bodyParamAttrs[parameter].type;
      resObj.markdown +=  `| ${newPrefix} | ${paramType || ''} | ${bodyParamAttrs[parameter].description || ''} | \n`;
      resObj.json[parameter] = returnParamTypeSample(bodyParamAttrs[parameter].format || bodyParamAttrs[parameter].type);
    }
  }
  return resObj;
}

function returnParamTypeSample(paramType) {
  let result;
  switch(paramType) {
    case 'uuid':
                result = 'uuid';
                break;
              case 'string':
                result = 'string';
                break;
              case 'number':
                result = 0;
                break;
              case 'array':
                result = 'Array';
                break;
              case 'boolean':
                result = 'boolean';
                break;
              case 'date-time':
                result = 'date-time';
                break;
              case 'date':
                result = 'date';
                break;
              case 'email':
                result = 'email';
                break;
  }
  return result;
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
    fs.writeFileSync(`docs/cloud/manage/api/${prefix}-api-reference.md`, markdownContent);
  }

  console.log('Markdown files generated successfully.');
}

main();
