import { createClient } from '@clickhouse/client'
import {jsonToTable, insertTextBetweenTags} from './utilities.mjs';

/*
This script is used to automatically generate the tables of data formats found at:
https://clickhouse.com/docs/en/interfaces/formats
https://clickhouse.com/docs/en/chdb/data-formats
 */

const play_endpoint = 'https://play.clickhouse.com/';
const client = createClient({
  /* configuration */
  url: play_endpoint,
  username: 'explorer'
})

const resultSet = await client.query({
  query: 'SELECT name AS Name, if(is_input, \'✔\', \'✗\') AS Input,' +
         'if(is_output, \'✔\', \'✗\') AS Output ' +
         'FROM system.formats ORDER BY name ASC'
})
const dataset = await resultSet.json()

let data_formats_table = jsonToTable(dataset.data)
// file paths should be provided relative
const file_paths = ['docs/en/interfaces/formats.md', 'docs/en/chdb/data-formats.md']
const startTag = '<!-- DATA FORMATS TABLE BEGIN -->';
const endTag = '<!-- DATA FORMATS TABLE END -->';

file_paths.forEach((file_path) => {
  insertTextBetweenTags(file_path, data_formats_table, startTag, endTag);
})
