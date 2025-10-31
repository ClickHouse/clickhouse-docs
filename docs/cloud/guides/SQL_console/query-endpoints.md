---
sidebar_title: 'Query API Endpoints'
slug: /cloud/get-started/query-endpoints
description: 'Easily spin up REST API endpoints from your saved queries'
keywords: ['api', 'query api endpoints', 'query endpoints', 'query rest api']
title: 'Query API Endpoints'
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import endpoints_testquery from '@site/static/images/cloud/sqlconsole/endpoints-testquery.png';
import endpoints_savequery from '@site/static/images/cloud/sqlconsole/endpoints-savequery.png';
import endpoints_configure from '@site/static/images/cloud/sqlconsole/endpoints-configure.png';
import endpoints_completed from '@site/static/images/cloud/sqlconsole/endpoints-completed.png';
import endpoints_curltest from '@site/static/images/cloud/sqlconsole/endpoints-curltest.png';
import endpoints_monitoring from '@site/static/images/cloud/sqlconsole/endpoints-monitoring.png';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Setting up query API endpoints

The **Query API Endpoints** feature allows you to create an API endpoint directly from any saved SQL query in the ClickHouse Cloud console. You'll be able to access API endpoints via HTTP to execute your saved queries without needing to connect to your ClickHouse Cloud service via a native driver.

## Pre-requisites {#quick-start-guide}

Before proceeding, ensure you have:
- an API key
- an Admin Console Role.

You can follow this guide to [create an API key](/cloud/manage/openapi) if you don't yet have one.

<VerticalStepper headerLevel="h3">

### Create a saved query {#creating-a-saved-query}

If you have a saved query, you can skip this step.

Open a new query tab. For demonstration purposes, we'll use the [youtube dataset](/getting-started/example-datasets/youtube-dislikes), which contains approximately 4.5 billion records.
Follow the steps in section ["Create table"](/getting-started/example-datasets/youtube-dislikes#create-the-table) to create the table on your Cloud service and insert data to it.

:::tip `LIMIT` the number of rows
The example dataset tutorial inserts a lot of data - 4.65 billion rows which can take some time to insert.
For the purposes of this guide we recommend to use the `LIMIT` clause to insert a smaller amount of data,
for example 10 million rows.
:::

As an example query, we'll return the top 10 uploaders by average views per video in a user-inputted `year` parameter.

```sql
WITH sum(view_count) AS view_sum,
  round(view_sum / num_uploads, 2) AS per_upload
SELECT
  uploader,
  count() AS num_uploads,
  formatReadableQuantity(view_sum) AS total_views,
  formatReadableQuantity(per_upload) AS views_per_video
FROM
  youtube
WHERE
-- highlight-next-line
  toYear(upload_date) = {year: UInt16}
GROUP BY uploader
ORDER BY per_upload desc
  LIMIT 10
```

Note that this query contains a parameter (`year`) which is highlighted in the snippet above.
You can specify query parameters using curly brackets `{ }` together with the type of the parameter. 
The SQL console query editor automatically detects ClickHouse query parameter expressions and provides an input for each parameter.

Let's quickly run this query to make sure that it works by specifying the year `2010` in the query variables input box on the right side of the SQL editor:

<Image img={endpoints_testquery} size="md" alt="Test the example query" />

Next, save the query:

<Image img={endpoints_savequery} size="md" alt="Save example query" />

More documentation around saved queries can be found in section ["Saving a query"](/cloud/get-started/sql-console#saving-a-query).

### Configuring the query API endpoint {#configuring-the-query-api-endpoint}

Query API endpoints can be configured directly from query view by clicking the **Share** button and selecting `API Endpoint`.
You'll be prompted to specify which API key(s) should be able to access the endpoint:

<Image img={endpoints_configure} size="md" alt="Configure query endpoint" />

After selecting an API key, you will be asked to:
- Select the Database role that will be used to run the query (`Full access`, `Read only` or `Create a custom role`)
- Specify cross-origin resource sharing (CORS) allowed domains

After selecting these options, the query API endpoint will automatically be provisioned.

An example `curl` command will be displayed so you can send a test request:

<Image img={endpoints_completed} size="md" alt="Endpoint curl command" />

The curl command displayed in the interface is given below for convenience:

```bash
curl -H "Content-Type: application/json" -s --user '<key_id>:<key_secret>' '<API-endpoint>?format=JSONEachRow&param_year=<value>'
```

### Query API parameters {#query-api-parameters}

Query parameters in a query can be specified with the syntax `{parameter_name: type}`. These parameters will be automatically detected and the example request payload will contain a `queryVariables` object through which you can pass these parameters.

### Testing and monitoring {#testing-and-monitoring}

Once a Query API endpoint is created, you can test that it works by using `curl` or any other HTTP client:

<Image img={endpoints_curltest} size="md" alt="endpoint curl test" />

After you've sent your first request, a new button should appear immediately to the right of the **Share** button. Clicking it will open a flyout containing monitoring data about the query:

<Image img={endpoints_monitoring} size="sm" alt="Endpoint monitoring" />

</VerticalStepper>

## Implementation details {#implementation-details}

This endpoint executes queries on your saved Query API endpoints.
It supports multiple versions, flexible response formats, parameterized queries, and optional streaming responses (version 2 only).

**Endpoint:**

```text
GET /query-endpoints/{queryEndpointId}/run
POST /query-endpoints/{queryEndpointId}/run
```

### HTTP methods {#http-methods}

| Method | Use Case | Parameters |
|---------|----------|------------|
| **GET** | Simple queries with parameters | Pass query variables via URL parameters (`?param_name=value`) |
| **POST** | Complex queries or when using request body | Pass query variables in request body (`queryVariables` object) |

**When to use GET:**
- Simple queries without complex nested data
- Parameters can be easily URL-encoded
- Caching benefits from HTTP GET semantics

**When to use POST:**
- Complex query variables (arrays, objects, large strings)
- When request body is preferred for security/privacy
- Streaming file uploads or large data

### Authentication {#authentication}

**Required:** Yes  
**Method:** Basic Auth using OpenAPI Key/Secret  
**Permissions:** Appropriate permissions for the query endpoint

### Request configuration {#request-configuration}

#### URL parameters {#url-params}

| Parameter | Required | Description |
|-----------|----------|-------------|
| `queryEndpointId` | **Yes** | The unique identifier of the query endpoint to run |

#### Query parameters {#query-params}

| Parameter | Required | Description | Example |
|-----------|----------|-------------|---------|
| `format` | No | Response format (supports all ClickHouse formats) | `?format=JSONEachRow` |
| `param_:name` | No | Query variables when request body is a stream. Replace `:name` with your variable name | `?param_year=2024` |
| `:clickhouse_setting` | No | Any supported [ClickHouse setting](https://clickhouse.com/docs/operations/settings/settings) | `?max_threads=8` |

#### Headers {#headers}

| Header | Required | Description | Values |
|--------|----------|-------------|--------|
| `x-clickhouse-endpoint-version` | No | Specifies the endpoint version | `1` or `2` (defaults to last saved version) |
| `x-clickhouse-endpoint-upgrade` | No | Triggers endpoint version upgrade (use with version header) | `1` to upgrade |

---

### Request body {#request-body}

#### Parameters {#params}

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `queryVariables` | object | No | Variables to be used in the query |
| `format` | string | No | Response format |

#### Supported formats {#supported-formats}

| Version                 | Supported Formats                                                                                                                                            |
|-------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Version 2**           | All ClickHouse-supported formats                                                                                                                             |
| **Version 1 (limited)** | TabSeparated <br/> TabSeparatedWithNames <br/> TabSeparatedWithNamesAndTypes <br/> JSON <br/> JSONEachRow <br/> CSV <br/> CSVWithNames <br/> CSVWithNamesAndTypes |

---

### Responses {#responses}

#### Success {#success}

**Status:** `200 OK`  
The query was successfully executed.

#### Error codes {#error-codes}

| Status Code | Description |
|-------------|-------------|
| `400 Bad Request` | The request was malformed |
| `401 Unauthorized` | Missing authentication or insufficient permissions |
| `404 Not Found` | The specified query endpoint was not found |

#### Error handling best practices {#error-handling-best-practices}

- Ensure valid authentication credentials are included in the request
- Validate the `queryEndpointId` and `queryVariables` before sending
- Implement graceful error handling with appropriate error messages

---

### Upgrading endpoint versions {#upgrading-endpoint-versions}

To upgrade from version 1 to version 2:

1. Include the `x-clickhouse-endpoint-upgrade` header set to `1`
2. Include the `x-clickhouse-endpoint-version` header set to `2`

This enables access to version 2 features including:
- Support for all ClickHouse formats
- Response streaming capabilities
- Enhanced performance and functionality

## Examples {#examples}

### Basic request {#basic-request}

**Query API Endpoint SQL:**

```sql
SELECT database, name AS num_tables FROM system.tables LIMIT 3;
```

#### Version 1 {#version-1}

<Tabs>
<TabItem value="cURL" label="cURL" default>

```bash
curl -X POST 'https://console-api.clickhouse.cloud/.api/query-endpoints/<endpoint id>/run' \
--user '<openApiKeyId:openApiKeySecret>' \
-H 'Content-Type: application/json' \
-d '{ "format": "JSONEachRow" }'
```
</TabItem>
<TabItem value="JavaScript" label="JavaScript" default>

```javascript
fetch(
  "https://console-api.clickhouse.cloud/.api/query-endpoints/<endpoint id>/run",
  {
    method: "POST",
    headers: {
      Authorization: "Basic <base64_encoded_credentials>",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      format: "JSONEachRow",
    }),
  }
)
  .then((response) => response.json())
  .then((data) => console.log(data))
  .catch((error) => console.error("Error:", error));
```

```json title="Response"
{
  "data": {
    "columns": [
      {
        "name": "database",
        "type": "String"
      },
      {
        "name": "num_tables",
        "type": "String"
      }
    ],
    "rows": [
      ["INFORMATION_SCHEMA", "COLUMNS"],
      ["INFORMATION_SCHEMA", "KEY_COLUMN_USAGE"],
      ["INFORMATION_SCHEMA", "REFERENTIAL_CONSTRAINTS"]
    ]
  }
}
```
</TabItem>
</Tabs>

#### Version 2 {#version-2}

<Tabs>
<TabItem value="GET" label="GET (cURL)" default>

```bash
curl 'https://console-api.clickhouse.cloud/.api/query-endpoints/<endpoint id>/run?format=JSONEachRow' \
--user '<openApiKeyId:openApiKeySecret>' \
-H 'x-clickhouse-endpoint-version: 2'
```

```application/x-ndjson title="Response"
{"database":"INFORMATION_SCHEMA","num_tables":"COLUMNS"}
{"database":"INFORMATION_SCHEMA","num_tables":"KEY_COLUMN_USAGE"}
{"database":"INFORMATION_SCHEMA","num_tables":"REFERENTIAL_CONSTRAINTS"}
```

</TabItem>
<TabItem value="cURL" label="POST (cURL)">

```bash
curl -X POST 'https://console-api.clickhouse.cloud/.api/query-endpoints/<endpoint id>/run?format=JSONEachRow' \
--user '<openApiKeyId:openApiKeySecret>' \
-H 'Content-Type: application/json' \
-H 'x-clickhouse-endpoint-version: 2'
```
</TabItem>
<TabItem value="JavaScript" label="JavaScript" default>

```javascript
fetch(
  "https://console-api.clickhouse.cloud/.api/query-endpoints/<endpoint id>/run?format=JSONEachRow",
  {
    method: "POST",
    headers: {
      Authorization: "Basic <base64_encoded_credentials>",
      "Content-Type": "application/json",
      "x-clickhouse-endpoint-version": "2",
    },
  }
)
  .then((response) => response.json())
  .then((data) => console.log(data))
  .catch((error) => console.error("Error:", error));
```

```application/x-ndjson title="Response"
{"database":"INFORMATION_SCHEMA","num_tables":"COLUMNS"}
{"database":"INFORMATION_SCHEMA","num_tables":"KEY_COLUMN_USAGE"}
{"database":"INFORMATION_SCHEMA","num_tables":"REFERENTIAL_CONSTRAINTS"}
```
</TabItem>
</Tabs>

### Request with query variables and version 2 on JSONCompactEachRow format {#request-with-query-variables-and-version-2-on-jsoncompacteachrow-format}

**Query API Endpoint SQL:**

```sql
SELECT name, database FROM system.tables WHERE match(name, {tableNameRegex: String}) AND database = {database: String};
```

<Tabs>
<TabItem value="GET" label="GET (cURL)" default>

```bash
curl 'https://console-api.clickhouse.cloud/.api/query-endpoints/<endpoint id>/run?format=JSONCompactEachRow&param_tableNameRegex=query.*&param_database=system' \
--user '<openApiKeyId:openApiKeySecret>' \
-H 'x-clickhouse-endpoint-version: 2'
```

```application/x-ndjson title="Response"
["query_cache", "system"]
["query_log", "system"]
["query_views_log", "system"]
```

</TabItem>
<TabItem value="cURL" label="POST (cURL)">

```bash
curl -X POST 'https://console-api.clickhouse.cloud/.api/query-endpoints/<endpoint id>/run?format=JSONCompactEachRow' \
--user '<openApiKeyId:openApiKeySecret>' \
-H 'Content-Type: application/json' \
-H 'x-clickhouse-endpoint-version: 2' \
-d '{ "queryVariables": { "tableNameRegex": "query.*", "database": "system" } }'
```
</TabItem>

<TabItem value="JavaScript" label="JavaScript" default>

```javascript
fetch(
  "https://console-api.clickhouse.cloud/.api/query-endpoints/<endpoint id>/run?format=JSONCompactEachRow",
  {
    method: "POST",
    headers: {
      Authorization: "Basic <base64_encoded_credentials>",
      "Content-Type": "application/json",
      "x-clickhouse-endpoint-version": "2",
    },
    body: JSON.stringify({
      queryVariables: {
        tableNameRegex: "query.*",
        database: "system",
      },
    }),
  }
)
  .then((response) => response.json())
  .then((data) => console.log(data))
  .catch((error) => console.error("Error:", error));
```

```application/x-ndjson title="Response"
["query_cache", "system"]
["query_log", "system"]
["query_views_log", "system"]
```
</TabItem>
</Tabs>

### Request with array in the query variables that inserts data into a table {#request-with-array-in-the-query-variables-that-inserts-data-into-a-table}

**Table SQL:**

```SQL
CREATE TABLE default.t_arr
(
    `arr` Array(Array(Array(UInt32)))
)
ENGINE = MergeTree
ORDER BY tuple()
```

**Query API Endpoint SQL:**

```sql
INSERT INTO default.t_arr VALUES ({arr: Array(Array(Array(UInt32)))});
```

<Tabs>
<TabItem value="cURL" label="cURL" default>

```bash
curl -X POST 'https://console-api.clickhouse.cloud/.api/query-endpoints/<endpoint id>/run' \
--user '<openApiKeyId:openApiKeySecret>' \
-H 'Content-Type: application/json' \
-H 'x-clickhouse-endpoint-version: 2' \
-d '{
  "queryVariables": {
    "arr": [[[12, 13, 0, 1], [12]]]
  }
}'
```

</TabItem>
<TabItem value="JavaScript" label="JavaScript" default>

```javascript
fetch(
  "https://console-api.clickhouse.cloud/.api/query-endpoints/<endpoint id>/run",
  {
    method: "POST",
    headers: {
      Authorization: "Basic <base64_encoded_credentials>",
      "Content-Type": "application/json",
      "x-clickhouse-endpoint-version": "2",
    },
    body: JSON.stringify({
      queryVariables: {
        arr: [[[12, 13, 0, 1], [12]]],
      },
    }),
  }
)
  .then((response) => response.json())
  .then((data) => console.log(data))
  .catch((error) => console.error("Error:", error));
```

```text title="Response"
OK
```

</TabItem>
</Tabs>

### Request with ClickHouse settings `max_threads` set to 8 {#request-with-clickhouse-settings-max_threads-set-to-8}

**Query API Endpoint SQL:**

```sql
SELECT * FROM system.tables;
```

<Tabs>
<TabItem value="GET" label="GET (cURL)" default>

```bash
curl 'https://console-api.clickhouse.cloud/.api/query-endpoints/<endpoint id>/run?max_threads=8' \
--user '<openApiKeyId:openApiKeySecret>' \
-H 'x-clickhouse-endpoint-version: 2'
```

</TabItem>
<TabItem value="cURL" label="POST (cURL)">

```bash
curl -X POST 'https://console-api.clickhouse.cloud/.api/query-endpoints/<endpoint id>/run?max_threads=8,' \
--user '<openApiKeyId:openApiKeySecret>' \
-H 'Content-Type: application/json' \
-H 'x-clickhouse-endpoint-version: 2' \
```

</TabItem>
<TabItem value="JavaScript" label="JavaScript">

```javascript
fetch(
  "https://console-api.clickhouse.cloud/.api/query-endpoints/<endpoint id>/run?max_threads=8",
  {
    method: "POST",
    headers: {
      Authorization: "Basic <base64_encoded_credentials>",
      "Content-Type": "application/json",
      "x-clickhouse-endpoint-version": "2",
    },
  }
)
  .then((response) => response.json())
  .then((data) => console.log(data))
  .catch((error) => console.error("Error:", error));
```

</TabItem>
</Tabs>

### Request and parse the response as a stream` {#request-and-parse-the-response-as-a-stream}

**Query API Endpoint SQL:**

```sql
SELECT name, database FROM system.tables;
```

<Tabs>
<TabItem value="TypeScript" label="TypeScript" default>

```typescript
async function fetchAndLogChunks(
  url: string,
  openApiKeyId: string,
  openApiKeySecret: string
) {
  const auth = Buffer.from(`${openApiKeyId}:${openApiKeySecret}`).toString(
    "base64"
  );

  const headers = {
    Authorization: `Basic ${auth}`,
    "x-clickhouse-endpoint-version": "2",
  };

  const response = await fetch(url, {
    headers,
    method: "POST",
    body: JSON.stringify({ format: "JSONEachRow" }),
  });

  if (!response.ok) {
    console.error(`HTTP error! Status: ${response.status}`);
    return;
  }

  const reader = response.body as unknown as Readable;
  reader.on("data", (chunk) => {
    console.log(chunk.toString());
  });

  reader.on("end", () => {
    console.log("Stream ended.");
  });

  reader.on("error", (err) => {
    console.error("Stream error:", err);
  });
}

const endpointUrl =
  "https://console-api.clickhouse.cloud/.api/query-endpoints/<endpoint id>/run?format=JSONEachRow";
const openApiKeyId = "<myOpenApiKeyId>";
const openApiKeySecret = "<myOpenApiKeySecret>";
// Usage example
fetchAndLogChunks(endpointUrl, openApiKeyId, openApiKeySecret).catch((err) =>
  console.error(err)
);
```

```shell title="Output"
> npx tsx index.ts
> {"name":"COLUMNS","database":"INFORMATION_SCHEMA"}
> {"name":"KEY_COLUMN_USAGE","database":"INFORMATION_SCHEMA"}
...
> Stream ended.
```

</TabItem>
</Tabs>

### Insert a stream from a file into a table {#insert-a-stream-from-a-file-into-a-table}

Create a file `./samples/my_first_table_2024-07-11.csv` with the following content:

```csv
"user_id","json","name"
"1","{""name"":""John"",""age"":30}","John"
"2","{""name"":""Jane"",""age"":25}","Jane"
```

**Create Table SQL:**

```sql
create table default.my_first_table
(
    user_id String,
    json String,
    name String,
) ENGINE = MergeTree()
ORDER BY user_id;
```

**Query API Endpoint SQL:**

```sql
INSERT INTO default.my_first_table
```

```bash
cat ./samples/my_first_table_2024-07-11.csv | curl --user '<openApiKeyId:openApiKeySecret>' \
                                                   -X POST \
                                                   -H 'Content-Type: application/octet-stream' \
                                                   -H 'x-clickhouse-endpoint-version: 2' \
                                                   "https://console-api.clickhouse.cloud/.api/query-endpoints/<endpoint id>/run?format=CSV" \
                                                   --data-binary @-
```
