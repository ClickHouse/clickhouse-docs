---
sidebar_title: Query API Endpoints
slug: /en/get-started/query-endpoints
description: Easily spin up REST API endpoints from your saved queries
keywords: [api, query api endpoints, query endpoints, query rest api]
---

import BetaBadge from '@theme/badges/BetaBadge';

# Query API Endpoints

<BetaBadge />

The **Query API Endpoints** feature allows you to create an API endpoint directly from any saved SQL query in the ClickHouse Cloud console. You'll be able to access API endpoints via HTTP to execute your saved queries without needing to connect to your ClickHouse Cloud service via a native driver.

## Quick-start Guide

Before proceeding, ensure you have an API key and an Admin Console Role. You can follow this guide to [create an API key](/docs/en/cloud/manage/openapi).

### Creating a saved query

If you have a saved query, you can skip this step.

Open a new query tab. For demonstration purposes, we'll use the [youtube dataset](/docs/en/getting-started/example-datasets/youtube-dislikes), which contains approximately 4.5 billion records. As an example query, we'll return the top 10 uploaders by average views per video in a user-inputted `year` parameter:

```sql
with sum(view_count) as view_sum,
    round(view_sum / num_uploads, 2) as per_upload
select
    uploader,
    count() as num_uploads,
    formatReadableQuantity(view_sum) as total_views,
    formatReadableQuantity(per_upload) as views_per_video
from
    youtube
where
    toYear(upload_date) = {year: UInt16}
group by uploader
order by per_upload desc
limit 10
```

Note that this query contains a parameter (`year`). The SQL console query editor automatically detects ClickHouse query parameter expressions and provides an input for each parameter. Let's quickly run this query to make sure that it works:

![Test the example query](@site/docs/en/cloud/images/sqlconsole/endpoints-testquery.png)

Next step, we'll go ahead and save the query:

![Save example query](@site/docs/en/cloud/images/sqlconsole/endpoints-savequery.png)

More documentation around saved queries can be found [here](/docs/en/get-started/sql-console#saving-a-query).

### Configuring the Query API Endpoint

Query API endpoints can be configured directly from query view by clicking the **Share** button and selecting `API Endpoint`. You'll be prompted to specify which API key(s) should be able to access the endpoint:

![Configure query endpoint](@site/docs/en/cloud/images/sqlconsole/endpoints-configure.png)

After selecting an API key, the query API endpoint will automatically be provisioned. An example `curl` command will be displayed so you can send a test request:

![Endpoint curl command](@site/docs/en/cloud/images/sqlconsole/endpoints-completed.png)

### Query API parameters

Query parameters in a query can be specified with the syntax `{parameter_name: type}`. These parameters will be automatically detected and the example request payload will contain a `queryVariables` object through which you can pass these parameters.

### Testing and monitoring

Once a Query API endpoint is created, you can test that it works by using `curl` or any other HTTP client:
<img src={require('@site/docs/en/cloud/images/sqlconsole/endpoints-curltest.png').default} class="image" alt="endpoint curl test" style={{width: '80%', background:'none'}} />

After you've sent your first request, a new button should appear immediately to the right of the **Share** button. Clicking it will open a flyout containing monitoring data about the query:

![Endpoint monitoring](@site/docs/en/cloud/images/sqlconsole/endpoints-monitoring.png)

## Implementation Details

### Description

This route runs a query on a specified query endpoint. It supports different versions, formats, and query variables. The response can be streamed (_version 2 only_) or returned as a single payload.

### Authentication

- **Required**: Yes
- **Method**: Basic Auth via OpenAPI Key/Secret
- **Permissions**: Appropriate permissions for the query endpoint.

### URL Parameters

- `queryEndpointId` (required): The unique identifier of the query endpoint to run.

### Query Parameters

#### V1

None

#### V2

- `format` (optional): The format of the response. Supports all formats supported by ClickHouse.
- `param_:name` Query variables to be used in the query. `name` should match the variable name in the query. This should only to be used when the body of the request is a stream.
- `:clickhouse_setting` Any supported [ClickHouse setting](https://clickhouse.com/docs/en/operations/settings/settings) can be passed as a query parameter.

### Headers

- `x-clickhouse-endpoint-version` (optional): The version of the query endpoint. Supported versions are `1` and `2`. If not provided, the default version is last saved for the endpoint.
- `x-clickhouse-endpoint-upgrade` (optional): Set this header to upgrade the endpoint version. This works in conjunction with the `x-clickhouse-endpoint-version` header.

### Request Body

- `queryVariables` (optional): An object containing variables to be used in the query.
- `format` (optional): The format of the response. If Query API Endpoint is version 2 any ClickHouse supported format is possible. Supported formats for v1 are:
  - TabSeparated
  - TabSeparatedWithNames
  - TabSeparatedWithNamesAndTypes
  - JSON
  - JSONEachRow
  - CSV
  - CSVWithNames
  - CSVWithNamesAndTypes

### Responses

- **200 OK**: The query was successfully executed.
- **400 Bad Request**: The request was malformed.
- **401 Unauthorized**: The request was made without authentication or with insufficient permissions.
- **404 Not Found**: The specified query endpoint was not found.

### Error Handling

- Ensure that the request includes valid authentication credentials.
- Validate the `queryEndpointId` and `queryVariables` to ensure they are correct.
- Handle any server errors gracefully, returning appropriate error messages.

### Upgrading the Endpoint Version

To upgrade the endpoint version from `v1` to `v2`, include the `x-clickhouse-endpoint-upgrade` header in the request and set it to `1`. This will trigger the upgrade process and allow you to use the features and improvements available in `v2`.

## Examples

### Basic Request

**Query API Endpoint SQL:**

```sql
SELECT database, name as num_tables FROM system.tables limit 3;
```

#### Version 1

**cURL:**

```bash
curl -X POST 'https://console-api.clickhouse.cloud/.api/query-endpoints/<endpoint id>/run' \
--user '<openApiKeyId:openApiKeySecret>' \
-H 'Content-Type: application/json' \
-d '{ "format": "JSONEachRow" }'
```

**JavaScript:**

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

**Response:**

```json
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

#### Version 2

**cURL:**

```bash
curl -X POST 'https://console-api.clickhouse.cloud/.api/query-endpoints/<endpoint id>/run?format=JSONEachRow' \
--user '<openApiKeyId:openApiKeySecret>' \
-H 'Content-Type: application/json' \
-H 'x-clickhouse-endpoint-version: 1'
```

**JavaScript:**

```javascript
fetch(
  "https://console-api.clickhouse.cloud/.api/query-endpoints/<endpoint id>/run?format=JSONEachRow",
  {
    method: "POST",
    headers: {
      Authorization: "Basic <base64_encoded_credentials>",
      "Content-Type": "application/json",
      "x-clickhouse-endpoint-version": "1",
    },
  }
)
  .then((response) => response.json())
  .then((data) => console.log(data))
  .catch((error) => console.error("Error:", error));
```

**Response:**

```application/x-ndjson
{"database":"INFORMATION_SCHEMA","num_tables":"COLUMNS"}
{"database":"INFORMATION_SCHEMA","num_tables":"KEY_COLUMN_USAGE"}
{"database":"INFORMATION_SCHEMA","num_tables":"REFERENTIAL_CONSTRAINTS"}
```

### Request with Query Variables and Version 2 on JSONCompactEachRow Format

**Query API Endpoint SQL:**

```sql
SELECT name, database FROM system.tables WHERE match(name, {tableNameRegex: String}) AND database = {database: String};
```

**cURL:**

```bash
curl -X POST 'https://console-api.clickhouse.cloud/.api/query-endpoints/<endpoint id>/run?format=JSONCompactEachRow' \
--user '<openApiKeyId:openApiKeySecret>' \
-H 'Content-Type: application/json' \
-H 'x-clickhouse-endpoint-version: 2' \
-d '{ "queryVariables": { "tableNameRegex": "query.*", "database": "system" } }'
```

**JavaScript:**

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

**Response:**

```application/x-ndjson
["query_cache", "system"]
["query_log", "system"]
["query_views_log", "system"]
```

### Request with Array in the query variables that inserts data into a table

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

**cURL:**

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

**JavaScript:**

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

**Response:**

```text
OK
```

### Request with ClickHouse settings max_threads set to 8`

**Query API Endpoint SQL:**

```sql
SELECT * from system.tables;
```

**cURL:**

```bash
curl -X POST 'https://console-api.clickhouse.cloud/.api/query-endpoints/<endpoint id>/run?max_threads=8,' \
--user '<openApiKeyId:openApiKeySecret>' \
-H 'Content-Type: application/json' \
-H 'x-clickhouse-endpoint-version: 2' \
```

**JavaScript:**

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

### Request and parse the response as a stream`

**Query API Endpoint SQL:**

```sql
SELECT name, database from system.tables;
```

**Typescript:**

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

**Output**

```shell
> npx tsx index.ts
> {"name":"COLUMNS","database":"INFORMATION_SCHEMA"}
> {"name":"KEY_COLUMN_USAGE","database":"INFORMATION_SCHEMA"}
...
> Stream ended.
```

### Insert a stream from a file into a table

create a file ./samples/my_first_table_2024-07-11.csv with the following content:

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

**cURL:**

```bash
cat ./samples/my_first_table_2024-07-11.csv | curl --user '<openApiKeyId:openApiKeySecret>' \
                                                   -X POST \
                                                   -H 'Content-Type: application/octet-stream' \
                                                   -H 'x-clickhouse-endpoint-version: 2' \
                                                   "https://console-api.clickhouse.cloud/.api/query-endpoints/<endpoint id>/run?format=CSV" \
                                                   --data-binary @-
```
