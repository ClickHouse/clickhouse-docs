---
sidebar_title: '查询 API 端点'
slug: /cloud/get-started/query-endpoints
description: '可基于已保存查询轻松创建 REST API 端点'
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

# 设置查询 API 端点 {#setting-up-query-api-endpoints}

**Query API Endpoints** 功能允许您在 ClickHouse Cloud 控制台中直接基于任意已保存的 SQL 查询创建一个 API 端点。之后，您可以通过 HTTP 调用这些 API 端点来执行已保存的查询，而无需通过原生驱动连接到 ClickHouse Cloud 服务。

## 先决条件 {#quick-start-guide}

在继续之前，请确保你已经具备：

- 一个具有相应权限的 API key
- 一个 Admin Console 角色

如果你还没有 API key，可以按照本指南[创建一个 API key](/cloud/manage/openapi)。

:::note 最低权限要求
要查询一个 API endpoint，API key 需要具备 `Member` 组织角色以及 `Query Endpoints` 服务访问权限。数据库角色会在你创建 endpoint 时进行配置。
:::

<VerticalStepper headerLevel="h3">

### 创建一个已保存查询 {#creating-a-saved-query}

如果你已经有一个已保存查询，可以跳过此步骤。

打开一个新的查询选项卡。作为示例，我们将使用 [youtube dataset](/getting-started/example-datasets/youtube-dislikes)，该数据集包含大约 45 亿条记录。
按照 ["Create table"](/getting-started/example-datasets/youtube-dislikes#create-the-table) 一节中的步骤，在你的 Cloud 服务上创建表并向其中插入数据。

:::tip 使用 `LIMIT` 限制行数
示例数据集教程会插入大量数据——46.5 亿行，这可能需要一些时间来插入。
出于本指南的目的，我们建议使用 `LIMIT` 子句插入较少量的数据，
例如 1000 万行。
:::

作为示例查询，我们将返回在用户输入的 `year` 参数对应年份中，每个视频平均观看次数最高的前 10 名上传者。

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

请注意，此查询包含一个参数（`year`），在上面的代码片段中已高亮显示。
你可以使用花括号 `{ }` 加上参数类型来指定查询参数。
SQL 控制台查询编辑器会自动检测 ClickHouse 查询参数表达式，并为每个参数提供一个输入框。

让我们快速运行一次此查询，通过在 SQL 编辑器右侧的查询变量输入框中指定年份 `2010` 来确保它可以正常工作：

<Image img={endpoints_testquery} size="md" alt="测试示例查询" />

接下来，将该查询保存下来：

<Image img={endpoints_savequery} size="md" alt="保存示例查询" />

有关已保存查询的更多文档，请参见 ["Saving a query"](/cloud/get-started/sql-console#saving-a-query) 一节。

### 配置查询 API endpoint {#configuring-the-query-api-endpoint}

可以在查询视图中直接配置 Query API endpoints，只需点击 **Share** 按钮并选择 `API Endpoint`。
系统会提示你指定哪些 API key 可以访问该 endpoint：

<Image img={endpoints_configure} size="md" alt="配置查询 endpoint" />

选择 API key 后，你将被要求：

- 选择用于运行查询的 Database 角色（`Full access`、`Read only` 或 `Create a custom role`）
- 指定允许跨域资源共享（CORS）的域名

选择这些选项后，查询 API endpoint 会被自动创建。

界面中会显示一个示例 `curl` 命令，以便你发送测试请求：

<Image img={endpoints_completed} size="md" alt="Endpoint 的 curl 命令" />

为了方便起见，界面中显示的 curl 命令如下所示：

```bash
curl -H "Content-Type: application/json" -s --user '<key_id>:<key_secret>' '<API-endpoint>?format=JSONEachRow&param_year=<value>'
```

### Query API 参数 {#query-api-parameters}

查询中的查询参数可以使用 `{parameter_name: type}` 这种语法来指定。这些参数会被自动检测到，示例请求载荷中会包含一个 `queryVariables` 对象，你可以通过该对象传递这些参数。

### 测试与监控 {#testing-and-monitoring}

创建 Query API endpoint 之后，你可以使用 `curl` 或任何其他 HTTP 客户端测试它是否正常工作：

<Image img={endpoints_curltest} size="md" alt="endpoint 的 curl 测试" />

在你发送第一条请求之后，**Share** 按钮右侧应会立即出现一个新按钮。点击它将打开一个包含该查询监控数据的侧边浮层：

<Image img={endpoints_monitoring} size="sm" alt="Endpoint 监控" />

</VerticalStepper>

## 实现细节 {#implementation-details}

该端点会在已保存的 Query API 端点上执行查询。
它支持多版本、灵活的响应格式、参数化查询，以及可选的流式响应（仅限版本 2）。

**端点：**

```text
GET /query-endpoints/{queryEndpointId}/run
POST /query-endpoints/{queryEndpointId}/run
```

### HTTP 方法 {#http-methods}

| Method | Use Case | Parameters |
|---------|----------|------------|
| **GET** | 带参数的简单查询 | 通过 URL 参数传递查询变量（`?param_name=value`） |
| **POST** | 复杂查询或需要使用请求体时 | 在请求体中传递查询变量（`queryVariables` 对象） |

**何时使用 GET：**

- 无复杂嵌套数据的简单查询
- 参数可以方便地进行 URL 编码
- 可以利用 HTTP GET 语义带来的缓存优势

**何时使用 POST：**

- 复杂的查询变量（数组、对象、长字符串）
- 出于安全/隐私考虑优先使用请求体时
- 需要进行文件流式上传或大体量数据传输时

### 身份验证 {#authentication}

**必需：** 是  
**方法：** 使用 OpenAPI Key/Secret 的 Basic Auth  
**权限：** 对查询端点具有相应权限

### 请求配置 {#request-configuration}

#### URL 参数 {#url-params}

| 参数 | 是否必需 | 描述 |
|-----------|----------|-------------|
| `queryEndpointId` | **是** | 要执行的查询端点的唯一标识符 |

#### 查询参数 {#query-params}

| 参数 | 是否必需 | 描述 | 示例 |
|-----------|----------|-------------|---------|
| `format` | 否 | 响应格式（支持所有 ClickHouse 格式） | `?format=JSONEachRow` |
| `param_:name` | 否 | 当请求体为流式数据时使用的查询变量。将 `:name` 替换为你的变量名 | `?param_year=2024` |
| `request_timeout` | 否 | 查询超时时间（毫秒）（默认值：30000） | `?request_timeout=60000` |
| `:clickhouse_setting` | 否 | 任意受支持的 [ClickHouse 设置项](https://clickhouse.com/docs/operations/settings/settings) | `?max_threads=8` |

#### 请求头 {#headers}

| Header | Required | Description | Values |
|--------|----------|-------------|--------|
| `x-clickhouse-endpoint-version` | No | 指定端点版本号 | `1` 或 `2`（默认为最近一次保存的版本） |
| `x-clickhouse-endpoint-upgrade` | No | 触发端点版本升级（与版本请求头配合使用） | `1` 表示升级 |

---

### 请求体 {#request-body}

#### 参数 {#params}

| 参数 | 类型 | 是否必填 | 描述 |
|-----------|------|----------|-------------|
| `queryVariables` | object | 否 | 在查询中使用的变量 |
| `format` | string | 否 | 响应格式 |

#### 支持的格式 {#supported-formats}

| 版本                    | 支持的格式                                                                                                                                                   |
|-------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Version 2**           | 所有 ClickHouse 所支持的格式                                                                                                                                  |
| **Version 1（功能受限）** | TabSeparated <br/> TabSeparatedWithNames <br/> TabSeparatedWithNamesAndTypes <br/> JSON <br/> JSONEachRow <br/> CSV <br/> CSVWithNames <br/> CSVWithNamesAndTypes |

---

### 响应 {#responses}

#### 成功 {#success}

**状态：** `200 OK`  
查询已成功执行。

#### 错误代码 {#error-codes}

| 状态码 | 描述 |
|-------------|-------------|
| `400 Bad Request` | 请求格式不正确 |
| `401 Unauthorized` | 缺少身份验证或权限不足 |
| `404 Not Found` | 未找到指定的查询接口 |

#### 错误处理最佳实践 {#error-handling-best-practices}

- 确保在请求中包含有效的身份验证凭据
- 在发送前校验 `queryEndpointId` 和 `queryVariables`
- 实现健壮的错误处理机制，并返回适当的错误信息

---

### 升级端点版本 {#upgrading-endpoint-versions}

要从版本 1 升级到版本 2：

1. 添加 `x-clickhouse-endpoint-upgrade` 请求头并设置为 `1`
2. 添加 `x-clickhouse-endpoint-version` 请求头并设置为 `2`

即可使用版本 2 的功能，包括：

- 支持所有 ClickHouse 格式
- 响应流式传输
- 更高的性能和更丰富的功能

## 示例 {#examples}

### 基本请求 {#basic-request}

**API 端点的 SQL 查询：**

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
<TabItem value="GET" label="GET（cURL）" default>

```bash
curl 'https://console-api.clickhouse.cloud/.api/query-endpoints/&lt;endpoint id&gt;/run?format=JSONEachRow' \
--user '&lt;openApiKeyId:openApiKeySecret&gt;' \
-H 'x-clickhouse-endpoint-version: 2'
```

```application/x-ndjson title="响应"
{"database":"INFORMATION_SCHEMA","num_tables":"COLUMNS"}
{"database":"INFORMATION_SCHEMA","num_tables":"KEY_COLUMN_USAGE"}
{"database":"INFORMATION_SCHEMA","num_tables":"REFERENTIAL_CONSTRAINTS"}
```

</TabItem>
<TabItem value="cURL" label="POST（cURL）">

```bash
curl -X POST 'https://console-api.clickhouse.cloud/.api/query-endpoints/&lt;endpoint id&gt;/run?format=JSONEachRow' \
--user '&lt;openApiKeyId:openApiKeySecret&gt;' \
-H 'Content-Type: application/json' \
-H 'x-clickhouse-endpoint-version: 2'
```
</TabItem>
<TabItem value="JavaScript" label="JavaScript" default>

```javascript
fetch(
  "https://console-api.clickhouse.cloud/.api/query-endpoints/&lt;endpoint id&gt;/run?format=JSONEachRow",
  {
    method: "POST",
    headers: {
      Authorization: "Basic &lt;base64_encoded_credentials&gt;",
      "Content-Type": "application/json",
      "x-clickhouse-endpoint-version": "2",
    },
  }
)
  .then((response) => response.json())
  .then((data) => console.log(data))
  .catch((error) => console.error("Error:", error));
```

```application/x-ndjson title="响应"
{"database":"INFORMATION_SCHEMA","num_tables":"COLUMNS"}
{"database":"INFORMATION_SCHEMA","num_tables":"KEY_COLUMN_USAGE"}
{"database":"INFORMATION_SCHEMA","num_tables":"REFERENTIAL_CONSTRAINTS"}
```
</TabItem>
</Tabs>

### 使用查询变量且采用 JSONCompactEachRow 格式（版本 2）的请求 {#request-with-query-variables-and-version-2-on-jsoncompacteachrow-format}

**查询 API 端点 SQL:**

```sql
SELECT name, database FROM system.tables WHERE match(name, {tableNameRegex: String}) AND database = {database: String};
```

<Tabs>
  <TabItem value="GET" label="GET（cURL）" default>
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

  <TabItem value="cURL" label="POST（cURL）">
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

    ```application/x-ndjson title="响应"
    ["query_cache", "system"]
    ["query_log", "system"]
    ["query_views_log", "system"]
    ```
  </TabItem>
</Tabs>

### 在查询变量中使用数组向表中插入数据的请求 {#request-with-array-in-the-query-variables-that-inserts-data-into-a-table}

**表的 SQL：**

```SQL
CREATE TABLE default.t_arr
(
    `arr` Array(Array(Array(UInt32)))
)
ENGINE = MergeTree
ORDER BY tuple()
```

**Query API 端点 SQL：**

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

    ```text title="响应"
    OK
    ```
  </TabItem>
</Tabs>

### 将 ClickHouse 设置 `max_threads` 为 8 的请求 {#request-with-clickhouse-settings-max_threads-set-to-8}

**查询 API 端点的 SQL：**

```sql
SELECT * FROM system.tables;
```

<Tabs>
  <TabItem value="GET" label="GET（cURL）" default>
    ```bash
    curl 'https://console-api.clickhouse.cloud/.api/query-endpoints/<endpoint id>/run?max_threads=8' \
    --user '<openApiKeyId:openApiKeySecret>' \
    -H 'x-clickhouse-endpoint-version: 2'
    ```
  </TabItem>

  <TabItem value="cURL" label="POST（cURL）">
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

### 以流的形式发送请求并解析响应` {#request-and-parse-the-response-as-a-stream}

**查询 API 端点的 SQL：**

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
    // 使用示例
    fetchAndLogChunks(endpointUrl, openApiKeyId, openApiKeySecret).catch((err) =>
      console.error(err)
    );
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

### 从文件向表中插入数据流 {#insert-a-stream-from-a-file-into-a-table}

创建文件 `./samples/my_first_table_2024-07-11.csv`，内容如下：

```csv
"user_id","json","name"
"1","{""name"":""John"",""age"":30}","John"
"2","{""name"":""Jane"",""age"":25}","Jane"
```

**创建表的 SQL 语句：**

```sql
create table default.my_first_table
(
    user_id String,
    json String,
    name String,
) ENGINE = MergeTree()
ORDER BY user_id;
```

**查询 API 端点的 SQL：**

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
