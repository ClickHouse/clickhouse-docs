---
'sidebar_title': 'Query API Endpoints'
'slug': '/cloud/get-started/query-endpoints'
'description': '轻松从您保存的查询生成 REST API 端点'
'keywords':
- 'api'
- 'query api endpoints'
- 'query endpoints'
- 'query rest api'
'title': '查询 API 端点'
'doc_type': 'guide'
---

import Image from '@theme/IdealImage';
import endpoints_testquery from '@site/static/images/cloud/sqlconsole/endpoints-testquery.png';
import endpoints_savequery from '@site/static/images/cloud/sqlconsole/endpoints-savequery.png';
import endpoints_configure from '@site/static/images/cloud/sqlconsole/endpoints-configure.png';
import endpoints_completed from '@site/static/images/cloud/sqlconsole/endpoints-completed.png';
import endpoints_curltest from '@site/static/images/cloud/sqlconsole/endpoints-curltest.png';
import endpoints_monitoring from '@site/static/images/cloud/sqlconsole/endpoints-monitoring.png';


# 查询 API 端点

**查询 API 端点** 功能允许您直接从 ClickHouse Cloud 控制台中的任何已保存 SQL 查询创建 API 端点。您可以通过 HTTP 访问 API 端点，以执行已保存的查询，而无需通过原生驱动程序连接到 ClickHouse Cloud 服务。

## 快速入门指南 {#quick-start-guide}

在继续之前，请确保您拥有 API 密钥和管理员控制台角色。您可以按照本指南 [创建 API 密钥](/cloud/manage/openapi)。

### 创建已保存的查询 {#creating-a-saved-query}

如果您已经有已保存的查询，可以跳过此步骤。

打开一个新的查询标签。为了演示，我们将使用 [youtube 数据集](/getting-started/example-datasets/youtube-dislikes)，该数据集包含大约 45 亿条记录。作为示例查询，我们将根据用户输入的 `year` 参数返回按平均每个视频观看次数排列的前 10 个上传者：

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
    toYear(upload_date) = {year: UInt16}
group by uploader
order by per_upload desc
limit 10
```

请注意，此查询包含一个参数（`year`）。SQL 控制台查询编辑器会自动检测 ClickHouse 查询参数表达式，并为每个参数提供一个输入。让我们快速运行此查询，以确保它有效：

<Image img={endpoints_testquery} size="md" alt="测试示例查询" />

下一步，我们将保存查询：

<Image img={endpoints_savequery} size="md" alt="保存示例查询" />

有关已保存查询的更多文档可在 [此处](/cloud/get-started/sql-console#saving-a-query) 找到。

### 配置查询 API 端点 {#configuring-the-query-api-endpoint}

查询 API 端点可以直接从查询视图配置，方法是点击 **Share** 按钮并选择 `API Endpoint`。系统会提示您指定哪些 API 密钥可以访问该端点：

<Image img={endpoints_configure} size="md" alt="配置查询端点" />

选择 API 密钥后，查询 API 端点将自动配置。将显示一个示例 `curl` 命令，您可以用来发送测试请求：

<Image img={endpoints_completed} size="md" alt="端点 curl 命令" />

### 查询 API 参数 {#query-api-parameters}

查询中的查询参数可以使用语法 `{parameter_name: type}` 指定。这些参数将被自动检测，示例请求有效载荷将包含一个 `queryVariables` 对象，通过该对象您可以传递这些参数。

### 测试和监控 {#testing-and-monitoring}

创建查询 API 端点后，您可以使用 `curl` 或任何其他 HTTP 客户端测试其是否有效：

<Image img={endpoints_curltest} size="md" alt="端点 curl 测试" />

发送完第一个请求后，**Share** 按钮右侧应立即出现一个新按钮。点击它将打开一个包含有关查询的监控数据的浮动窗口：

<Image img={endpoints_monitoring} size="md" alt="端点监控" />

## 实现细节 {#implementation-details}

### 描述 {#description}

此路由在指定的查询端点上运行查询。它支持不同的版本、格式和查询变量。响应可以是流式的（_仅限版本 2_）或作为单个有效载荷返回。

### 身份验证 {#authentication}

- **必需**：是
- **方法**：通过 OpenAPI 密钥/秘密的基本身份验证
- **权限**：查询端点的适当权限。

### URL 参数 {#url-parameters}

- `queryEndpointId`（必需）：要运行的查询端点的唯一标识符。

### 查询参数 {#query-parameters}

#### V1 {#v1}

无

#### V2 {#v2}

- `format`（可选）：响应的格式。支持 ClickHouse 支持的所有格式。
- `param_:name` 查询变量，用于查询。`name` 应与查询中的变量名称匹配。这个仅在请求的主体为流时使用。
- `:clickhouse_setting` 任何受支持的 [ClickHouse 设置](/operations/settings/settings) 可以作为查询参数传递。

### 头部 {#headers}

- `x-clickhouse-endpoint-version`（可选）：查询端点的版本。支持的版本为 `1` 和 `2`。如果未提供，则默认版本为为该端点最后保存的版本。
- `x-clickhouse-endpoint-upgrade`（可选）：设置此头部以升级端点版本。此工作与 `x-clickhouse-endpoint-version` 头部一起使用。

### 请求主体 {#request-body}

- `queryVariables`（可选）：一个包含用于查询的变量的对象。
- `format`（可选）：响应的格式。如果查询 API 端点是版本 2，则可以使用任何 ClickHouse 支持的格式。v1 支持的格式包括：
  - TabSeparated
  - TabSeparatedWithNames
  - TabSeparatedWithNamesAndTypes
  - JSON
  - JSONEachRow
  - CSV
  - CSVWithNames
  - CSVWithNamesAndTypes

### 响应 {#responses}

- **200 OK**：查询成功执行。
- **400 Bad Request**：请求格式错误。
- **401 Unauthorized**：请求未经身份验证或权限不足。
- **404 Not Found**：未找到指定的查询端点。

### 错误处理 {#error-handling}

- 确保请求包含有效的身份验证凭据。
- 验证 `queryEndpointId` 和 `queryVariables` 以确保它们正确。
- 优雅地处理服务器错误，返回适当的错误信息。

### 升级端点版本 {#upgrading-the-endpoint-version}

要将端点版本从 `v1` 升级到 `v2`，请在请求中包含 `x-clickhouse-endpoint-upgrade` 头，并将其设置为 `1`。这将触发升级过程，并允许您使用 `v2` 中可用的功能和改进。

## 示例 {#examples}

### 基本请求 {#basic-request}

**查询 API 端点 SQL：**

```sql
SELECT database, name AS num_tables FROM system.tables LIMIT 3;
```

#### 版本 1 {#version-1}

**cURL：**

```bash
curl -X POST 'https://console-api.clickhouse.cloud/.api/query-endpoints/<endpoint id>/run' \
--user '<openApiKeyId:openApiKeySecret>' \
-H 'Content-Type: application/json' \
-d '{ "format": "JSONEachRow" }'
```

**JavaScript：**

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

**响应：**

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

#### 版本 2 {#version-2}

**cURL：**

```bash
curl -X POST 'https://console-api.clickhouse.cloud/.api/query-endpoints/<endpoint id>/run?format=JSONEachRow' \
--user '<openApiKeyId:openApiKeySecret>' \
-H 'Content-Type: application/json' \
-H 'x-clickhouse-endpoint-version: 2'
```

**JavaScript：**

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

**响应：**

```application/x-ndjson
{"database":"INFORMATION_SCHEMA","num_tables":"COLUMNS"}
{"database":"INFORMATION_SCHEMA","num_tables":"KEY_COLUMN_USAGE"}
{"database":"INFORMATION_SCHEMA","num_tables":"REFERENTIAL_CONSTRAINTS"}
```

### 带有查询变量和版本 2 的 JSONCompactEachRow 格式请求 {#request-with-query-variables-and-version-2-on-jsoncompacteachrow-format}

**查询 API 端点 SQL：**

```sql
SELECT name, database FROM system.tables WHERE match(name, {tableNameRegex: String}) AND database = {database: String};
```

**cURL：**

```bash
curl -X POST 'https://console-api.clickhouse.cloud/.api/query-endpoints/<endpoint id>/run?format=JSONCompactEachRow' \
--user '<openApiKeyId:openApiKeySecret>' \
-H 'Content-Type: application/json' \
-H 'x-clickhouse-endpoint-version: 2' \
-d '{ "queryVariables": { "tableNameRegex": "query.*", "database": "system" } }'
```

**JavaScript：**

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

**响应：**

```application/x-ndjson
["query_cache", "system"]
["query_log", "system"]
["query_views_log", "system"]
```

### 请求带有数组的查询变量以将数据插入表 {#request-with-array-in-the-query-variables-that-inserts-data-into-a-table}

**表 SQL：**

```SQL
CREATE TABLE default.t_arr
(
    `arr` Array(Array(Array(UInt32)))
)
ENGINE = MergeTree
ORDER BY tuple()
```

**查询 API 端点 SQL：**

```sql
INSERT INTO default.t_arr VALUES ({arr: Array(Array(Array(UInt32)))});
```

**cURL：**

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

**JavaScript：**

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

**响应：**

```text
OK
```

### 请求并将 ClickHouse 设置 max_threads 设置为 8 {#request-with-clickhouse-settings-max_threads-set-to-8}

**查询 API 端点 SQL：**

```sql
SELECT * FROM system.tables;
```

**cURL：**

```bash
curl -X POST 'https://console-api.clickhouse.cloud/.api/query-endpoints/<endpoint id>/run?max_threads=8,' \
--user '<openApiKeyId:openApiKeySecret>' \
-H 'Content-Type: application/json' \
-H 'x-clickhouse-endpoint-version: 2' \
```

**JavaScript：**

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

### 请求并将响应解析为流 {#request-and-parse-the-response-as-a-stream}

**查询 API 端点 SQL：**

```sql
SELECT name, database FROM system.tables;
```

**Typescript：**

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

**输出**

```shell
> npx tsx index.ts
> {"name":"COLUMNS","database":"INFORMATION_SCHEMA"}
> {"name":"KEY_COLUMN_USAGE","database":"INFORMATION_SCHEMA"}
...
> Stream ended.
```

### 从文件插入流到表 {#insert-a-stream-from-a-file-into-a-table}

创建一个文件 ./samples/my_first_table_2024-07-11.csv，内容如下：

```csv
"user_id","json","name"
"1","{""name"":""John"",""age"":30}","John"
"2","{""name"":""Jane"",""age"":25}","Jane"
```

**创建表 SQL：**

```sql
create table default.my_first_table
(
    user_id String,
    json String,
    name String,
) ENGINE = MergeTree()
ORDER BY user_id;
```

**查询 API 端点 SQL：**

```sql
INSERT INTO default.my_first_table
```

**cURL：**

```bash
cat ./samples/my_first_table_2024-07-11.csv | curl --user '<openApiKeyId:openApiKeySecret>' \
                                                   -X POST \
                                                   -H 'Content-Type: application/octet-stream' \
                                                   -H 'x-clickhouse-endpoint-version: 2' \
                                                   "https://console-api.clickhouse.cloud/.api/query-endpoints/<endpoint id>/run?format=CSV" \
                                                   --data-binary @-
```
