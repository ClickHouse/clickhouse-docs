---
sidebar_title: 'クエリAPIエンドポイント'
slug: /cloud/get-started/query-endpoints
description: '保存されたクエリからREST APIエンドポイントを簡単に立ち上げることができます'
keywords: ['api', 'query api endpoints', 'query endpoints', 'query rest api']
title: 'クエリAPIエンドポイント'
---

import Image from '@theme/IdealImage';
import endpoints_testquery from '@site/static/images/cloud/sqlconsole/endpoints-testquery.png';
import endpoints_savequery from '@site/static/images/cloud/sqlconsole/endpoints-savequery.png';
import endpoints_configure from '@site/static/images/cloud/sqlconsole/endpoints-configure.png';
import endpoints_completed from '@site/static/images/cloud/sqlconsole/endpoints-completed.png';
import endpoints_curltest from '@site/static/images/cloud/sqlconsole/endpoints-curltest.png';
import endpoints_monitoring from '@site/static/images/cloud/sqlconsole/endpoints-monitoring.png';


# クエリAPIエンドポイント

**クエリAPIエンドポイント**機能を使用すると、ClickHouse Cloudコンソール内の保存済みSQLクエリから直接APIエンドポイントを作成できます。ネイティブドライバを介してClickHouse Cloudサービスに接続することなく、HTTPを介してAPIエンドポイントにアクセスして、保存されたクエリを実行することができます。

## クイックスタートガイド {#quick-start-guide}

進む前に、APIキーと管理コンソールロールを持っていることを確認してください。 このガイドに従って、[APIキーを作成](/cloud/manage/openapi)できます。

### 保存されたクエリの作成 {#creating-a-saved-query}

保存されたクエリがある場合は、この手順をスキップできます。

新しいクエリタブを開きます。デモンストレーションのために、約45億レコードを含む[youtubeデータセット](/getting-started/example-datasets/youtube-dislikes)を使用します。クエリの例として、ユーザー入力の`year`パラメータに基づいて、1ビデオあたりの平均ビューで上位10件のアップローダーを返します：

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

このクエリにはパラメータ（`year`）が含まれていることに注意してください。SQLコンソールクエリエディタは、ClickHouseクエリパラメータ式を自動的に検出し、それぞれのパラメータに対する入力を提供します。このクエリが機能することを確認するために、さっそく実行してみましょう：

<Image img={endpoints_testquery} size="md" alt="例のクエリをテスト" />

次のステップでは、クエリを保存します：

<Image img={endpoints_savequery} size="md" alt="例のクエリを保存" />

保存されたクエリに関する詳細なドキュメントは[こちら](/cloud/get-started/sql-console#saving-a-query)にあります。

### クエリAPIエンドポイントの構成 {#configuring-the-query-api-endpoint}

クエリAPIエンドポイントは、クエリビューから直接**共有**ボタンをクリックし、`APIエンドポイント`を選択することで構成できます。エンドポイントにアクセスできるAPIキーを指定するよう求められます：

<Image img={endpoints_configure} size="md" alt="クエリエンドポイントを構成" />

APIキーを選択すると、クエリAPIエンドポイントが自動的にプロビジョニングされます。テストリクエストを送信できるように、例の`curl`コマンドが表示されます：

<Image img={endpoints_completed} size="md" alt="エンドポイントcurlコマンド" />

### クエリAPIパラメータ {#query-api-parameters}

クエリ内のクエリパラメータは、`{parameter_name: type}`の構文で指定できます。これらのパラメータは自動的に検出され、例のリクエストペイロードにはこれらのパラメータを渡すための`queryVariables`オブジェクトが含まれます。

### テストと監視 {#testing-and-monitoring}

クエリAPIエンドポイントが作成されると、それが機能するかどうかを`curl`や他のHTTPクライアントを使用してテストできます：

<Image img={endpoints_curltest} size="md" alt="エンドポイントcurlテスト" />

最初のリクエストを送信すると、**共有**ボタンのすぐ右に新しいボタンが表示されるはずです。それをクリックすると、クエリに関する監視データが含まれるフライアウトが開きます：

<Image img={endpoints_monitoring} size="md" alt="エンドポイント監視" />

## 実装の詳細 {#implementation-details}

### 説明 {#description}

このルートは、指定されたクエリエンドポイント上でクエリを実行します。さまざまなバージョン、フォーマット、およびクエリ変数をサポートしています。レスポンスはストリーミング（_バージョン2のみ_）または単一のペイロードとして返されます。

### 認証 {#authentication}

- **必須**: はい
- **方法**: OpenAPIキー/シークレット経由のベーシック認証
- **権限**: クエリエンドポイントに対する適切な権限。

### URLパラメータ {#url-parameters}

- `queryEndpointId`（必須）：実行するクエリエンドポイントの一意の識別子。

### クエリパラメータ {#query-parameters}

#### V1 {#v1}

なし

#### V2 {#v2}

- `format`（オプション）：レスポンスのフォーマット。ClickHouseがサポートするすべてのフォーマットをサポートします。
- `param_:name` クエリに使用されるクエリ変数。`name`はクエリ内の変数名と一致する必要があります。これはリクエストのボディがストリームの場合にのみ使用されるべきです。
- `:clickhouse_setting` 任意のサポートされた[ClickHouse設定](/operations/settings/settings)をクエリパラメータとして渡すことができます。

### ヘッダー {#headers}

- `x-clickhouse-endpoint-version`（オプション）：クエリエンドポイントのバージョン。サポートされているバージョンは`1`と`2`です。指定されていない場合、デフォルトのバージョンは最後に保存されたものです。
- `x-clickhouse-endpoint-upgrade`（オプション）：エンドポイントバージョンをアップグレードするためにこのヘッダーを設定します。これは`x-clickhouse-endpoint-version`ヘッダーと組み合わせて機能します。

### リクエストボディ {#request-body}

- `queryVariables`（オプション）：クエリで使用される変数を含むオブジェクト。
- `format`（オプション）：レスポンスのフォーマット。クエリAPIエンドポイントがバージョン2の場合、ClickHouseがサポートする任意のフォーマットが可能です。v1でサポートされているフォーマットは以下の通りです：
  - TabSeparated
  - TabSeparatedWithNames
  - TabSeparatedWithNamesAndTypes
  - JSON
  - JSONEachRow
  - CSV
  - CSVWithNames
  - CSVWithNamesAndTypes

### レスポンス {#responses}

- **200 OK**: クエリは正常に実行されました。
- **400 Bad Request**: リクエストが不正でした。
- **401 Unauthorized**: 認証なしまたは権限不足でリクエストが行われました。
- **404 Not Found**: 指定されたクエリエンドポイントが見つかりませんでした。

### エラーハンドリング {#error-handling}

- リクエストに有効な認証情報が含まれていることを確認してください。
- `queryEndpointId`と`queryVariables`が正しいことを検証してください。
- サーバーエラーを適切に処理し、適切なエラーメッセージを返します。

### エンドポイントバージョンのアップグレード {#upgrading-the-endpoint-version}

エンドポイントのバージョンを`v1`から`v2`にアップグレードするには、リクエストに`x-clickhouse-endpoint-upgrade`ヘッダーを含めて`1`に設定します。これによりアップグレードプロセスがトリガーされ、`v2`で利用可能な機能や改善を使用できます。

## 例 {#examples}

### 基本リクエスト {#basic-request}

**クエリAPIエンドポイントSQL:**

```sql
SELECT database, name as num_tables FROM system.tables limit 3;
```

#### バージョン1 {#version-1}

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

**レスポンス:**

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

#### バージョン2 {#version-2}

**cURL:**

```bash
curl -X POST 'https://console-api.clickhouse.cloud/.api/query-endpoints/<endpoint id>/run?format=JSONEachRow' \
--user '<openApiKeyId:openApiKeySecret>' \
-H 'Content-Type: application/json' \
-H 'x-clickhouse-endpoint-version: 2'
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
      "x-clickhouse-endpoint-version": "2",
    },
  }
)
  .then((response) => response.json())
  .then((data) => console.log(data))
  .catch((error) => console.error("Error:", error));
```

**レスポンス:**

```application/x-ndjson
{"database":"INFORMATION_SCHEMA","num_tables":"COLUMNS"}
{"database":"INFORMATION_SCHEMA","num_tables":"KEY_COLUMN_USAGE"}
{"database":"INFORMATION_SCHEMA","num_tables":"REFERENTIAL_CONSTRAINTS"}
```

### クエリ変数を含むリクエストとJSONCompactEachRowフォーマットでのバージョン2 {#request-with-query-variables-and-version-2-on-jsoncompacteachrow-format}

**クエリAPIエンドポイントSQL:**

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

**レスポンス:**

```application/x-ndjson
["query_cache", "system"]
["query_log", "system"]
["query_views_log", "system"]
```

### 配列をクエリ変数に含めてテーブルにデータを挿入するリクエスト {#request-with-array-in-the-query-variables-that-inserts-data-into-a-table}

**テーブルSQL:**

```sql
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

**レスポンス:**

```text
OK
```

### ClickHouse設定max_threadsを8に設定したリクエスト {#request-with-clickhouse-settings-max_threads-set-to-8}

**クエリAPIエンドポイントSQL:**

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

### ストリームからのリクエストとレスポンスをストリームとして解析 {#request-and-parse-the-response-as-a-stream}

**クエリAPIエンドポイントSQL:**

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
    console.error(`HTTPエラー！ステータス: ${response.status}`);
    return;
  }

  const reader = response.body as unknown as Readable;
  reader.on("data", (chunk) => {
    console.log(chunk.toString());
  });

  reader.on("end", () => {
    console.log("ストリームが終了しました。");
  });

  reader.on("error", (err) => {
    console.error("ストリームエラー:", err);
  });
}

const endpointUrl =
  "https://console-api.clickhouse.cloud/.api/query-endpoints/<endpoint id>/run?format=JSONEachRow";
const openApiKeyId = "<myOpenApiKeyId>";
const openApiKeySecret = "<myOpenApiKeySecret>";
// 使用例
fetchAndLogChunks(endpointUrl, openApiKeyId, openApiKeySecret).catch((err) =>
  console.error(err)
);
```

**出力**

```shell
> npx tsx index.ts
> {"name":"COLUMNS","database":"INFORMATION_SCHEMA"}
> {"name":"KEY_COLUMN_USAGE","database":"INFORMATION_SCHEMA"}
...
> ストリームが終了しました。
```

### ファイルからテーブルにストリームを挿入 {#insert-a-stream-from-a-file-into-a-table}

`./samples/my_first_table_2024-07-11.csv`というファイルを作成し、以下の内容を記入します：

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

**cURL:**

```bash
cat ./samples/my_first_table_2024-07-11.csv | curl --user '<openApiKeyId:openApiKeySecret>' \
                                                   -X POST \
                                                   -H 'Content-Type: application/octet-stream' \
                                                   -H 'x-clickhouse-endpoint-version: 2' \
                                                   "https://console-api.clickhouse.cloud/.api/query-endpoints/<endpoint id>/run?format=CSV" \
                                                   --data-binary @-
