---
sidebar_title: '查询 API 端点'
slug: /cloud/get-started/query-endpoints
description: '从已保存的查询快速生成 REST API 端点'
keywords: ['API', '查询 API 端点', '查询端点', '查询 REST API']
title: '查询 API 端点'
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


# 配置查询 API 端点

**Query API Endpoints** 功能允许用户在 ClickHouse Cloud 控制台中，直接基于任意已保存的 SQL 查询创建 API 端点。这样就可以通过 HTTP 访问这些 API 端点来执行已保存的查询，而无需通过原生驱动连接到 ClickHouse Cloud 服务。



## 先决条件 {#quick-start-guide}

在继续之前，请确保你已具备：
- 一个具有相应权限的 API key
- 一个 Admin Console Role

如果你还没有 API key，可以按照此指南[创建一个 API key](/cloud/manage/openapi)。

:::note 最低权限
要查询一个 API endpoint，API key 需要具有 `Member` 组织角色以及 `Query Endpoints` 服务访问权限。数据库角色会在你创建该 endpoint 时进行配置。
:::

<VerticalStepper headerLevel="h3">

### 创建保存的查询 {#creating-a-saved-query}

如果你已经有一个保存的查询，可以跳过此步骤。

打开一个新的查询标签页。为了演示，我们将使用 [YouTube 数据集](/getting-started/example-datasets/youtube-dislikes)，其中大约包含 45 亿条记录。
按照[“Create table”](/getting-started/example-datasets/youtube-dislikes#create-the-table)小节中的步骤，在你的 Cloud 服务上创建该表并向其中插入数据。

:::tip 使用 `LIMIT` 限制行数
示例数据集教程会插入大量数据——46.5 亿行，插入可能需要一些时间。
在本指南中，我们建议使用 `LIMIT` 子句来插入较少量的数据，
例如 1000 万行。
:::

作为示例查询，我们将按用户输入的 `year` 参数，返回按每个视频平均观看次数排序的前 10 位上传者。

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
-- 高亮下一行
  toYear(upload_date) = {year: UInt16}
GROUP BY uploader
ORDER BY per_upload desc
  LIMIT 10
```

请注意，该查询包含一个参数（`year`），在上面的代码片段中已高亮显示。
你可以使用花括号 `{ }` 连同参数类型来指定查询参数。
SQL 控制台查询编辑器会自动检测 ClickHouse 查询参数表达式，并为每个参数提供一个输入框。

让我们快速运行此查询，通过在 SQL 编辑器右侧的查询变量输入框中指定年份 `2010`，以确认该查询可以正常工作：

<Image img={endpoints_testquery} size="md" alt="测试示例查询" />

接下来，保存该查询：

<Image img={endpoints_savequery} size="md" alt="保存示例查询" />

有关保存查询的更多文档，请参阅[“Saving a query”](/cloud/get-started/sql-console#saving-a-query)小节。

### 配置查询 API endpoint {#configuring-the-query-api-endpoint}

可以在查询视图中直接配置查询 API endpoint，方法是单击 **Share** 按钮并选择 `API Endpoint`。
系统会提示你指定哪些 API key 可以访问该 endpoint：

<Image img={endpoints_configure} size="md" alt="配置查询 endpoint" />

选择 API key 之后，你需要：
- 选择用于运行查询的 Database 角色（`Full access`、`Read only` 或 `Create a custom role`）
- 指定允许跨域资源共享（CORS）的域名

选择这些选项后，查询 API endpoint 将自动创建完成。

界面中会显示一个示例 `curl` 命令，便于你发送测试请求：

<Image img={endpoints_completed} size="md" alt="Endpoint 的 curl 命令" />

为方便起见，界面中显示的 curl 命令如下所示：

```bash
curl -H "Content-Type: application/json" -s --user '<key_id>:<key_secret>' '<API-endpoint>?format=JSONEachRow&param_year=<value>'
```

### Query API 参数 {#query-api-parameters}

查询中的参数可以使用 `{parameter_name: type}` 语法进行指定。这些参数会被自动检测到，示例请求负载中将包含一个 `queryVariables` 对象，你可以通过该对象传递这些参数。

### 测试与监控 {#testing-and-monitoring}

一旦创建了一个 Query API endpoint，你就可以使用 `curl` 或任何其他 HTTP 客户端对其进行测试：

<Image img={endpoints_curltest} size="md" alt="endpoint curl 测试" />

在你发送第一条请求后，**Share** 按钮右侧应立即出现一个新按钮。单击该按钮会打开一个浮出面板，其中包含有关该查询的监控数据：

<Image img={endpoints_monitoring} size="sm" alt="Endpoint 监控" />

</VerticalStepper>



## 实现细节

此端点会在已保存的 Query API 端点上执行查询。
它支持多个版本、灵活的响应格式、参数化查询，以及可选的流式响应（仅限版本 2）。

**端点：**

```text
GET /query-endpoints/{queryEndpointId}/run
POST /query-endpoints/{queryEndpointId}/run
```

### HTTP 方法

| Method   | Use Case    | Parameters                           |
| -------- | ----------- | ------------------------------------ |
| **GET**  | 带参数的简单查询    | 通过 URL 参数传递查询变量（`?param_name=value`） |
| **POST** | 复杂查询或使用请求体时 | 在请求体中传递查询变量（`queryVariables` 对象）     |

**何时使用 GET：**

* 无复杂嵌套数据的简单查询
* 参数可以方便地进行 URL 编码
* 可以利用 HTTP GET 语义带来的缓存收益

**何时使用 POST：**

* 复杂查询变量（数组、对象、大字符串）
* 出于安全/隐私考虑，优先使用请求体时
* 流式文件上传或大数据量传输

### 认证

**是否必需：** 是\
**方式：** 使用 OpenAPI Key/Secret 的 Basic Auth\
**权限：** 对查询 endpoint 具有相应权限

### 请求配置

#### URL 参数

| Parameter         | Required | Description            |
| ----------------- | -------- | ---------------------- |
| `queryEndpointId` | **Yes**  | 要运行的查询 endpoint 的唯一标识符 |

#### 查询参数

| Parameter             | Required | Description                                                                           | Example               |
| --------------------- | -------- | ------------------------------------------------------------------------------------- | --------------------- |
| `format`              | No       | 响应格式（支持所有 ClickHouse 格式）                                                              | `?format=JSONEachRow` |
| `param_:name`         | No       | 当请求体是流时使用的查询变量。将 `:name` 替换为你的变量名                                                     | `?param_year=2024`    |
| `:clickhouse_setting` | No       | 任意受支持的 [ClickHouse setting](https://clickhouse.com/docs/operations/settings/settings) | `?max_threads=8`      |

#### Headers

| Header                          | Required | Description                       | Values                  |
| ------------------------------- | -------- | --------------------------------- | ----------------------- |
| `x-clickhouse-endpoint-version` | No       | 指定 endpoint 版本                    | `1` 或 `2`（默认为最近一次保存的版本） |
| `x-clickhouse-endpoint-upgrade` | No       | 触发 endpoint 版本升级（与版本 header 一起使用） | 置为 `1` 以升级              |

***

### 请求体

#### 参数

| Parameter        | Type   | Required | Description |
| ---------------- | ------ | -------- | ----------- |
| `queryVariables` | object | No       | 查询中要使用的变量   |
| `format`         | string | No       | 响应格式        |

#### 支持的格式

| Version                 | Supported Formats                                                                                                                                                        |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Version 2**           | 支持所有 ClickHouse 格式                                                                                                                                                       |
| **Version 1 (limited)** | TabSeparated <br /> TabSeparatedWithNames <br /> TabSeparatedWithNamesAndTypes <br /> JSON <br /> JSONEachRow <br /> CSV <br /> CSVWithNames <br /> CSVWithNamesAndTypes |

***

### 响应

#### 成功

**Status：** `200 OK`\
查询已成功执行。

#### 错误代码

| Status Code        | Description       |
| ------------------ | ----------------- |
| `400 Bad Request`  | 请求格式不正确           |
| `401 Unauthorized` | 缺少认证信息或权限不足       |
| `404 Not Found`    | 未找到指定的查询 endpoint |

#### 错误处理最佳实践

* 确保在请求中包含有效的认证凭据
* 在发送前验证 `queryEndpointId` 和 `queryVariables`
* 实现优雅的错误处理，并返回适当的错误消息

***

### 升级 endpoint 版本

要从版本 1 升级到版本 2：

1. 添加 `x-clickhouse-endpoint-upgrade` header，并设置为 `1`
2. 添加 `x-clickhouse-endpoint-version` header，并设置为 `2`

这将启用对版本 2 功能的访问，包括：

* 支持所有 ClickHouse 格式
* 响应流式传输能力
* 更高性能和增强的功能


## 示例 {#examples}

### 基本请求 {#basic-request}

**查询 API 端点 SQL：**

```sql
SELECT database, name AS num_tables FROM system.tables LIMIT 3;
```

#### 版本 1 {#version-1}

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
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      format: "JSONEachRow"
    })
  }
)
  .then((response) => response.json())
  .then((data) => console.log(data))
  .catch((error) => console.error("Error:", error))
```

```json title="响应"
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

#### 版本 2 {#version-2}

<Tabs>
<TabItem value="GET" label="GET (cURL)" default>

```bash
curl 'https://console-api.clickhouse.cloud/.api/query-endpoints/<endpoint id>/run?format=JSONEachRow' \
--user '<openApiKeyId:openApiKeySecret>' \
-H 'x-clickhouse-endpoint-version: 2'
```

```application/x-ndjson title="响应"
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
      "x-clickhouse-endpoint-version": "2"
    }
  }
)
  .then((response) => response.json())
  .then((data) => console.log(data))
  .catch((error) => console.error("Error:", error))
```

```application/x-ndjson title="响应"
{"database":"INFORMATION_SCHEMA","num_tables":"COLUMNS"}
{"database":"INFORMATION_SCHEMA","num_tables":"KEY_COLUMN_USAGE"}
{"database":"INFORMATION_SCHEMA","num_tables":"REFERENTIAL_CONSTRAINTS"}
```

</TabItem>
</Tabs>

### 使用查询变量和版本 2 的 JSONCompactEachRow 格式请求 {#request-with-query-variables-and-version-2-on-jsoncompacteachrow-format}

**查询 API 端点 SQL：**

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

```application/x-ndjson title="响应"
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
      "x-clickhouse-endpoint-version": "2"
    },
    body: JSON.stringify({
      queryVariables: {
        tableNameRegex: "query.*",
        database: "system"
      }
    })
  }
)
  .then((response) => response.json())
  .then((data) => console.log(data))
  .catch((error) => console.error("Error:", error))
```

```application/x-ndjson title="响应"
["query_cache", "system"]
["query_log", "system"]
["query_views_log", "system"]
```

</TabItem>
</Tabs>

### 使用查询变量中的数组向表插入数据的请求 {#request-with-array-in-the-query-variables-that-inserts-data-into-a-table}

**表 SQL:**

```SQL
CREATE TABLE default.t_arr
(
    `arr` Array(Array(Array(UInt32)))
)
ENGINE = MergeTree
ORDER BY tuple()
```

**查询 API 端点 SQL:**

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
      "x-clickhouse-endpoint-version": "2"
    },
    body: JSON.stringify({
      queryVariables: {
        arr: [[[12, 13, 0, 1], [12]]]
      }
    })
  }
)
  .then((response) => response.json())
  .then((data) => console.log(data))
  .catch((error) => console.error("Error:", error))
```

```text title="响应"
OK
```

</TabItem>
</Tabs>

### 将 ClickHouse 设置 `max_threads` 设为 8 的请求 {#request-with-clickhouse-settings-max_threads-set-to-8}

**查询 API 端点 SQL:**

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
      "x-clickhouse-endpoint-version": "2"
    }
  }
)
  .then((response) => response.json())
  .then((data) => console.log(data))
  .catch((error) => console.error("Error:", error))
```

</TabItem>
</Tabs>

### 以流式方式请求并解析响应 {#request-and-parse-the-response-as-a-stream}

**查询 API 端点 SQL：**

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
  )

  const headers = {
    Authorization: `Basic ${auth}`,
    "x-clickhouse-endpoint-version": "2"
  }

  const response = await fetch(url, {
    headers,
    method: "POST",
    body: JSON.stringify({ format: "JSONEachRow" })
  })

  if (!response.ok) {
    console.error(`HTTP error! Status: ${response.status}`)
    return
  }

  const reader = response.body as unknown as Readable
  reader.on("data", (chunk) => {
    console.log(chunk.toString())
  })

  reader.on("end", () => {
    console.log("Stream ended.")
  })

  reader.on("error", (err) => {
    console.error("Stream error:", err)
  })
}

const endpointUrl =
  "https://console-api.clickhouse.cloud/.api/query-endpoints/<endpoint id>/run?format=JSONEachRow"
const openApiKeyId = "<myOpenApiKeyId>"
const openApiKeySecret = "<myOpenApiKeySecret>"
// Usage example
fetchAndLogChunks(endpointUrl, openApiKeyId, openApiKeySecret).catch((err) =>
  console.error(err)
)
```

```shell title="输出"
> npx tsx index.ts
> {"name":"COLUMNS","database":"INFORMATION_SCHEMA"}
> {"name":"KEY_COLUMN_USAGE","database":"INFORMATION_SCHEMA"}
...
> Stream ended.
```

</TabItem>
</Tabs>

### 将文件流插入表 {#insert-a-stream-from-a-file-into-a-table}

创建文件 `./samples/my_first_table_2024-07-11.csv`，内容如下：

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

```bash
cat ./samples/my_first_table_2024-07-11.csv | curl --user '<openApiKeyId:openApiKeySecret>' \
                                                   -X POST \
                                                   -H 'Content-Type: application/octet-stream' \
                                                   -H 'x-clickhouse-endpoint-version: 2' \
                                                   "https://console-api.clickhouse.cloud/.api/query-endpoints/<endpoint id>/run?format=CSV" \
                                                   --data-binary @-
```
