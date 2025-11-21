---
sidebar_title: '查询 API 端点'
slug: /cloud/get-started/query-endpoints
description: '基于已保存的查询轻松创建 REST API 端点'
keywords: ['api', '查询 API 端点', '查询端点', '查询 REST API']
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


# 设置查询 API 端点

**Query API Endpoints** 功能允许您在 ClickHouse Cloud 控制台中，直接基于任意已保存的 SQL 查询创建一个 API 端点。您可以通过 HTTP 调用这些 API 端点来执行已保存的查询，而无需通过原生驱动程序连接到您的 ClickHouse Cloud 服务。



## 前置条件 {#quick-start-guide}

在继续之前,请确保您具备:

- 具有适当权限的 API 密钥
- Admin Console 角色

如果您还没有 API 密钥,可以按照本指南[创建 API 密钥](/cloud/manage/openapi)。

:::note 最低权限要求
要查询 API 端点,API 密钥需要具有 `Member` 组织角色以及 `Query Endpoints` 服务访问权限。数据库角色在创建端点时配置。
:::

<VerticalStepper headerLevel="h3">

### 创建已保存的查询 {#creating-a-saved-query}

如果您已有保存的查询,可以跳过此步骤。

打开一个新的查询标签页。为了演示目的,我们将使用 [youtube 数据集](/getting-started/example-datasets/youtube-dislikes),该数据集包含约 45 亿条记录。
按照["创建表"](/getting-started/example-datasets/youtube-dislikes#create-the-table)部分的步骤在您的 Cloud 服务上创建表并向其中插入数据。

:::tip 使用 `LIMIT` 限制行数
示例数据集教程会插入大量数据 - 46.5 亿行,这可能需要较长时间来插入。
为了本指南的目的,我们建议使用 `LIMIT` 子句插入较少量的数据,
例如 1000 万行。
:::

作为示例查询,我们将返回用户输入的 `year` 参数中按每个视频平均观看次数排名前 10 的上传者。

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

请注意,此查询包含一个参数 (`year`),在上面的代码片段中已突出显示。
您可以使用花括号 `{ }` 以及参数类型来指定查询参数。
SQL 控制台查询编辑器会自动检测 ClickHouse 查询参数表达式,并为每个参数提供输入框。

让我们快速运行此查询以确保其正常工作,在 SQL 编辑器右侧的查询变量输入框中指定年份 `2010`:

<Image img={endpoints_testquery} size='md' alt='测试示例查询' />

接下来,保存查询:

<Image img={endpoints_savequery} size='md' alt='保存示例查询' />

有关已保存查询的更多文档可以在["保存查询"](/cloud/get-started/sql-console#saving-a-query)部分找到。

### 配置查询 API 端点 {#configuring-the-query-api-endpoint}

查询 API 端点可以直接从查询视图中配置,方法是点击 **Share** 按钮并选择 `API Endpoint`。
系统将提示您指定哪些 API 密钥可以访问该端点:

<Image img={endpoints_configure} size='md' alt='配置查询端点' />

选择 API 密钥后,系统将要求您:

- 选择将用于运行查询的数据库角色(`Full access`、`Read only` 或 `Create a custom role`)
- 指定跨源资源共享 (CORS) 允许的域

选择这些选项后,查询 API 端点将自动完成配置。

系统将显示一个示例 `curl` 命令,以便您可以发送测试请求:

<Image img={endpoints_completed} size='md' alt='端点 curl 命令' />

为方便起见,界面中显示的 curl 命令如下:

```bash
curl -H "Content-Type: application/json" -s --user '<key_id>:<key_secret>' '<API-endpoint>?format=JSONEachRow&param_year=<value>'
```

### 查询 API 参数 {#query-api-parameters}

查询中的查询参数可以使用语法 `{parameter_name: type}` 指定。这些参数将被自动检测,示例请求负载将包含一个 `queryVariables` 对象,您可以通过该对象传递这些参数。

### 测试和监控 {#testing-and-monitoring}

创建查询 API 端点后,您可以使用 `curl` 或任何其他 HTTP 客户端测试其是否正常工作:

<Image img={endpoints_curltest} size='md' alt='端点 curl 测试' />

发送第一个请求后,**Share** 按钮右侧应立即出现一个新按钮。点击它将打开一个包含查询监控数据的弹出窗口:

<Image img={endpoints_monitoring} size='sm' alt='端点监控' />

</VerticalStepper>


## 实现细节 {#implementation-details}

此端点用于执行已保存的 Query API 端点上的查询。
支持多个版本、灵活的响应格式、参数化查询以及可选的流式响应(仅版本 2)。

**端点:**

```text
GET /query-endpoints/{queryEndpointId}/run
POST /query-endpoints/{queryEndpointId}/run
```

### HTTP 方法 {#http-methods}

| 方法   | 使用场景                                   | 参数                                                     |
| -------- | ------------------------------------------ | -------------------------------------------------------------- |
| **GET**  | 带参数的简单查询             | 通过 URL 参数传递查询变量(`?param_name=value`)  |
| **POST** | 复杂查询或使用请求体时 | 在请求体中传递查询变量(`queryVariables` 对象) |

**何时使用 GET:**

- 不包含复杂嵌套数据的简单查询
- 参数可以轻松进行 URL 编码
- 利用 HTTP GET 语义的缓存优势

**何时使用 POST:**

- 复杂的查询变量(数组、对象、大字符串)
- 出于安全/隐私考虑优先使用请求体
- 流式文件上传或大数据传输

### 身份验证 {#authentication}

**必需:** 是  
**方法:** 使用 OpenAPI Key/Secret 的基本身份验证  
**权限:** 查询端点所需的相应权限

### 请求配置 {#request-configuration}

#### URL 参数 {#url-params}

| 参数         | 必需 | 描述                                        |
| ----------------- | -------- | -------------------------------------------------- |
| `queryEndpointId` | **是**  | 要运行的查询端点的唯一标识符 |

#### 查询参数 {#query-params}

| 参数             | 必需 | 描述                                                                                  | 示例               |
| --------------------- | -------- | -------------------------------------------------------------------------------------------- | --------------------- |
| `format`              | 否       | 响应格式(支持所有 ClickHouse 格式)                                            | `?format=JSONEachRow` |
| `param_:name`         | 否       | 当请求体为流时的查询变量。将 `:name` 替换为您的变量名       | `?param_year=2024`    |
| `:clickhouse_setting` | 否       | 任何支持的 [ClickHouse 设置](https://clickhouse.com/docs/operations/settings/settings) | `?max_threads=8`      |

#### 请求头 {#headers}

| 请求头                          | 必需 | 描述                                                 | 值                                      |
| ------------------------------- | -------- | ----------------------------------------------------------- | ------------------------------------------- |
| `x-clickhouse-endpoint-version` | 否       | 指定端点版本                              | `1` 或 `2`(默认为最后保存的版本) |
| `x-clickhouse-endpoint-upgrade` | 否       | 触发端点版本升级(与版本请求头一起使用) | `1` 表示升级                              |

---

### 请求体 {#request-body}

#### 参数 {#params}

| 参数        | 类型   | 必需 | 描述                       |
| ---------------- | ------ | -------- | --------------------------------- |
| `queryVariables` | object | 否       | 查询中使用的变量 |
| `format`         | string | 否       | 响应格式                   |

#### 支持的格式 {#supported-formats}

| 版本                 | 支持的格式                                                                                                                                                 |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **版本 2**           | 所有 ClickHouse 支持的格式                                                                                                                                  |
| **版本 1(受限)** | TabSeparated <br/> TabSeparatedWithNames <br/> TabSeparatedWithNamesAndTypes <br/> JSON <br/> JSONEachRow <br/> CSV <br/> CSVWithNames <br/> CSVWithNamesAndTypes |

---

### 响应 {#responses}

#### 成功 {#success}

**状态:** `200 OK`  
查询已成功执行。

#### 错误代码 {#error-codes}

| 状态码        | 描述                                        |
| ------------------ | -------------------------------------------------- |
| `400 Bad Request`  | 请求格式错误                          |
| `401 Unauthorized` | 缺少身份验证或权限不足 |
| `404 Not Found`    | 未找到指定的查询端点         |

#### 错误处理最佳实践 {#error-handling-best-practices}

- 确保请求中包含有效的身份验证凭据
- 在发送前验证 `queryEndpointId` 和 `queryVariables`
- 实现优雅的错误处理并提供适当的错误消息

---

### 升级端点版本 {#upgrading-endpoint-versions}

要从版本 1 升级到版本 2:

1. 包含设置为 `1` 的 `x-clickhouse-endpoint-upgrade` 请求头
2. 包含设置为 `2` 的 `x-clickhouse-endpoint-version` 请求头

这将启用版本 2 的功能,包括:

- 支持所有 ClickHouse 格式
- 响应流式传输能力
- 增强的性能和功能


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

**查询 API 端点 SQL:**

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
> 流结束。
```

</TabItem>
</Tabs>

### 将文件中的流式数据插入表 {#insert-a-stream-from-a-file-into-a-table}

创建文件 `./samples/my_first_table_2024-07-11.csv`,内容如下:

```csv
"user_id","json","name"
"1","{""name"":""John"",""age"":30}","John"
"2","{""name"":""Jane"",""age"":25}","Jane"
```

**创建表 SQL:**

```sql
create table default.my_first_table
(
    user_id String,
    json String,
    name String,
) ENGINE = MergeTree()
ORDER BY user_id;
```

**查询 API 端点 SQL:**

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
