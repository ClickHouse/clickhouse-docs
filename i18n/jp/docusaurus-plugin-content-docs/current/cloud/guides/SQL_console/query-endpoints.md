---
sidebar_title: 'クエリ API エンドポイント'
slug: /cloud/get-started/query-endpoints
description: '保存済みクエリから REST API エンドポイントを簡単に公開できる'
keywords: ['api', 'クエリ API エンドポイント', 'クエリエンドポイント', 'クエリ REST API']
title: 'クエリ API エンドポイント'
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


# クエリ API エンドポイントの設定 {#setting-up-query-api-endpoints}

**Query API Endpoints** 機能を使用すると、ClickHouse Cloud コンソールから任意の保存済み SQL クエリを元に、直接 API エンドポイントを作成できます。HTTP 経由で API エンドポイントにアクセスすることで、ネイティブドライバーを使って ClickHouse Cloud サービスに接続しなくても、保存済みクエリを実行できるようになります。



## 前提条件 {#quick-start-guide}

次の項目を用意してから先に進んでください:
- 適切な権限を持つ API キー
- Admin Console ロール

まだ API キーを持っていない場合は、このガイドに従って [API キーを作成](/cloud/manage/openapi) できます。

:::note 最低限必要な権限
API エンドポイントに対してクエリを実行するには、API キーに `Member` 組織ロールと `Query Endpoints` サービスアクセスが必要です。データベースロールはエンドポイントを作成するときに設定します。
:::

<VerticalStepper headerLevel="h3">

### 保存済みクエリを作成する {#creating-a-saved-query}

既に保存済みクエリがある場合は、このステップをスキップできます。

新しいクエリタブを開きます。デモンストレーションとして、約 45 億レコードを含む [youtube データセット](/getting-started/example-datasets/youtube-dislikes) を使用します。
["Create table"](/getting-started/example-datasets/youtube-dislikes#create-the-table) セクションの手順に従って、Cloud サービス上にテーブルを作成し、データを挿入してください。

:::tip 行数を `LIMIT` で制限する
このサンプルデータセットのチュートリアルでは 46.5 億行と非常に多くのデータを挿入するため、挿入に時間がかかる可能性があります。
このガイドの目的のためには、`LIMIT` 句を使用して、より少ないデータ量 (たとえば 1,000 万行) を挿入することを推奨します。
:::

例として、ユーザーが入力する `year` パラメータごとに、動画あたり平均視聴回数が多い上位 10 人のアップローダーを返すクエリを使用します。

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

このクエリには、上のスニペット内でハイライトされているパラメータ (`year`) が含まれている点に注意してください。
クエリパラメータは、パラメータの型とともに中かっこ `{ }` を使って指定できます。
SQL コンソールのクエリエディタは ClickHouse のクエリパラメータ式を自動的に検出し、各パラメータに対応する入力欄を提供します。

SQL エディタ右側のクエリ変数入力ボックスで年に `2010` を指定し、このクエリをすばやく実行して動作を確認してみましょう:

<Image img={endpoints_testquery} size="md" alt="サンプルクエリをテストする" />

次に、クエリを保存します:

<Image img={endpoints_savequery} size="md" alt="サンプルクエリを保存する" />

保存済みクエリに関する詳細なドキュメントは ["Saving a query"](/cloud/get-started/sql-console#saving-a-query) セクションにあります。

### Query API エンドポイントの設定 {#configuring-the-query-api-endpoint}

クエリビューから、**Share** ボタンをクリックして `API Endpoint` を選択することで、Query API エンドポイントを直接設定できます。
どの API キーに対してエンドポイントへのアクセスを許可するか指定するよう求められます:

<Image img={endpoints_configure} size="md" alt="クエリエンドポイントを設定する" />

API キーを選択したら、次の内容を指定します:
- クエリの実行に使用する Database ロール (`Full access`, `Read only` または `Create a custom role`)
- クロスオリジンリソース共有 (CORS) で許可するドメイン

これらのオプションを選択すると、Query API エンドポイントが自動的にプロビジョニングされます。

テストリクエストを送信できるように、サンプルの `curl` コマンドが表示されます:

<Image img={endpoints_completed} size="md" alt="エンドポイント用 curl コマンド" />

参考までに、インターフェイスに表示される curl コマンドを以下に示します:

```bash
curl -H "Content-Type: application/json" -s --user '<key_id>:<key_secret>' '<API-endpoint>?format=JSONEachRow&param_year=<value>'
```

### Query API パラメータ {#query-api-parameters}

クエリ内のクエリパラメータは `{parameter_name: type}` という構文で指定できます。これらのパラメータは自動的に検出され、サンプルリクエストのペイロードには、これらのパラメータを渡すための `queryVariables` オブジェクトが含まれます。

### テストとモニタリング {#testing-and-monitoring}

Query API エンドポイントを作成したら、`curl` やその他の HTTP クライアントを使用して、正しく動作するかテストできます:

<Image img={endpoints_curltest} size="md" alt="エンドポイントの curl テスト" />

最初のリクエストを送信すると、**Share** ボタンのすぐ右側に新しいボタンが表示されます。これをクリックすると、クエリに関するモニタリングデータを含むフライアウトパネルが開きます:

<Image img={endpoints_monitoring} size="sm" alt="エンドポイントのモニタリング" />

</VerticalStepper>



## 実装の詳細 {#implementation-details}

このエンドポイントは、保存済みの Query API エンドポイント上でクエリを実行します。
複数バージョンに対応し、柔軟なレスポンス形式、パラメータ化されたクエリ、およびオプションのストリーミングレスポンス（バージョン 2 のみ）をサポートします。

**エンドポイント:**

```text
GET /query-endpoints/{queryEndpointId}/run
POST /query-endpoints/{queryEndpointId}/run
```

### HTTP メソッド {#http-methods}

| Method   | Use Case             | Parameters                                  |
| -------- | -------------------- | ------------------------------------------- |
| **GET**  | パラメータ付きのシンプルなクエリ     | URL パラメータでクエリ変数を渡す（`?param_name=value`）     |
| **POST** | 複雑なクエリ、またはボディを利用する場合 | リクエストボディ内でクエリ変数を渡す（`queryVariables` オブジェクト） |

**GET を使用する場面:**

* 入れ子構造を含まないシンプルなクエリ
* パラメータを容易に URL エンコードできる場合
* HTTP GET のセマンティクスによるキャッシュの利点を活用したい場合

**POST を使用する場面:**

* 配列、オブジェクト、大きな文字列などの複雑なクエリ変数
* セキュリティ／プライバシー上、リクエストボディの利用が望ましい場合
* ファイルのストリーミングアップロードや大容量データを送信する場合

### 認証 {#authentication}

**必須:** Yes\
**方式:** OpenAPI Key/Secret を用いた Basic 認証\
**権限:** クエリエンドポイントに対して適切な権限が必要

### リクエスト構成 {#request-configuration}

#### URL パラメータ {#url-params}

| Parameter         | Required | Description           |
| ----------------- | -------- | --------------------- |
| `queryEndpointId` | **Yes**  | 実行するクエリエンドポイントの一意な識別子 |

#### クエリパラメータ {#query-params}

| Parameter             | Required | Description                                                                                 | Example               |
| --------------------- | -------- | ------------------------------------------------------------------------------------------- | --------------------- |
| `format`              | No       | レスポンスフォーマット（すべての ClickHouse フォーマットをサポート）                                                    | `?format=JSONEachRow` |
| `param_:name`         | No       | リクエストボディがストリームの場合のクエリ変数。`:name` を変数名に置き換える                                                  | `?param_year=2024`    |
| `:clickhouse_setting` | No       | 任意のサポートされている [ClickHouse setting](https://clickhouse.com/docs/operations/settings/settings) | `?max_threads=8`      |

#### ヘッダー {#headers}

| Header                          | Required | Description                         | Values                           |
| ------------------------------- | -------- | ----------------------------------- | -------------------------------- |
| `x-clickhouse-endpoint-version` | No       | エンドポイントのバージョンを指定                    | `1` または `2`（デフォルトは最後に保存されたバージョン） |
| `x-clickhouse-endpoint-upgrade` | No       | エンドポイントのバージョンアップをトリガー（バージョンヘッダーと併用） | `1` を指定してアップグレード                 |

***

### リクエストボディ {#request-body}

#### パラメータ {#params}

| Parameter        | Type   | Required | Description |
| ---------------- | ------ | -------- | ----------- |
| `queryVariables` | object | No       | クエリ内で使用する変数 |
| `format`         | string | No       | レスポンスフォーマット |

#### サポートされるフォーマット {#supported-formats}

| Version                 | Supported Formats                                                                                                                                                        |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Version 2**           | ClickHouse がサポートするすべてのフォーマット                                                                                                                                             |
| **Version 1 (limited)** | TabSeparated <br /> TabSeparatedWithNames <br /> TabSeparatedWithNamesAndTypes <br /> JSON <br /> JSONEachRow <br /> CSV <br /> CSVWithNames <br /> CSVWithNamesAndTypes |

***

### レスポンス {#responses}

#### 成功時 {#success}

**Status:** `200 OK`\
クエリは正常に実行されました。

#### エラーコード {#error-codes}

| Status Code        | Description           |
| ------------------ | --------------------- |
| `400 Bad Request`  | リクエストの形式が不正           |
| `401 Unauthorized` | 認証情報の欠如、または権限不足       |
| `404 Not Found`    | 指定されたクエリエンドポイントが存在しない |

#### エラー処理のベストプラクティス {#error-handling-best-practices}

* リクエストに有効な認証情報が含まれていることを確認する
* 送信前に `queryEndpointId` と `queryVariables` を検証する
* 適切なエラーメッセージを含むグレースフルなエラー処理を実装する

***

### エンドポイントバージョンのアップグレード {#upgrading-endpoint-versions}

Version 1 から Version 2 にアップグレードするには:

1. `x-clickhouse-endpoint-upgrade` ヘッダーを `1` に設定して含める
2. `x-clickhouse-endpoint-version` ヘッダーを `2` に設定して含める

これにより、以下を含む Version 2 の機能にアクセスできます:

* すべての ClickHouse フォーマットのサポート
* レスポンスのストリーミング機能
* パフォーマンスおよび機能の強化


## 例 {#examples}

### 基本的なリクエスト {#basic-request}

**クエリAPIエンドポイントSQL:**

```sql
SELECT database, name AS num_tables FROM system.tables LIMIT 3;
```

#### バージョン1 {#version-1}

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

```json title="レスポンス"
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

#### バージョン2 {#version-2}

<Tabs>
<TabItem value="GET" label="GET (cURL)" default>

```bash
curl 'https://console-api.clickhouse.cloud/.api/query-endpoints/<endpoint id>/run?format=JSONEachRow' \
--user '<openApiKeyId:openApiKeySecret>' \
-H 'x-clickhouse-endpoint-version: 2'
```

```application/x-ndjson title="レスポンス"
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

```application/x-ndjson title="レスポンス"
{"database":"INFORMATION_SCHEMA","num_tables":"COLUMNS"}
{"database":"INFORMATION_SCHEMA","num_tables":"KEY_COLUMN_USAGE"}
{"database":"INFORMATION_SCHEMA","num_tables":"REFERENTIAL_CONSTRAINTS"}
```

</TabItem>
</Tabs>

### クエリ変数とバージョン2を使用したJSONCompactEachRow形式のリクエスト {#request-with-query-variables-and-version-2-on-jsoncompacteachrow-format}

**クエリAPIエンドポイントSQL:**

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

```application/x-ndjson title="レスポンス"
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

```application/x-ndjson title="レスポンス"
["query_cache", "system"]
["query_log", "system"]
["query_views_log", "system"]
```

</TabItem>
</Tabs>

### クエリ変数内の配列を使用してテーブルにデータを挿入するリクエスト {#request-with-array-in-the-query-variables-that-inserts-data-into-a-table}

**テーブルSQL:**

```SQL
CREATE TABLE default.t_arr
(
    `arr` Array(Array(Array(UInt32)))
)
ENGINE = MergeTree
ORDER BY tuple()
```

**クエリAPIエンドポイントSQL:**

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

```text title="レスポンス"
OK
```

</TabItem>
</Tabs>

### ClickHouse設定`max_threads`を8に設定したリクエスト {#request-with-clickhouse-settings-max_threads-set-to-8}

**クエリAPIエンドポイントSQL:**

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

### ストリームとしてレスポンスをリクエストして解析する {#request-and-parse-the-response-as-a-stream}

**クエリAPIエンドポイントSQL:**

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

```shell title="出力"
> npx tsx index.ts
> {"name":"COLUMNS","database":"INFORMATION_SCHEMA"}
> {"name":"KEY_COLUMN_USAGE","database":"INFORMATION_SCHEMA"}
...
> Stream ended.
```

</TabItem>
</Tabs>

### ファイルからテーブルへストリームを挿入する {#insert-a-stream-from-a-file-into-a-table}

以下の内容で `./samples/my_first_table_2024-07-11.csv` ファイルを作成します:

```csv
"user_id","json","name"
"1","{""name"":""John"",""age"":30}","John"
"2","{""name"":""Jane"",""age"":25}","Jane"
```

**テーブル作成SQL:**

```sql
create table default.my_first_table
(
    user_id String,
    json String,
    name String,
) ENGINE = MergeTree()
ORDER BY user_id;
```

**クエリAPIエンドポイントSQL:**

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
