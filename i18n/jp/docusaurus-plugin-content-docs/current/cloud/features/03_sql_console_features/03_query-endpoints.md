---
'sidebar_title': 'Query API Endpoints'
'slug': '/cloud/get-started/query-endpoints'
'description': '保存したクエリから REST API エンドポイントを簡単に立ち上げます'
'keywords':
- 'api'
- 'query api endpoints'
- 'query endpoints'
- 'query rest api'
'title': 'クエリ API エンドポイント'
'doc_type': 'guide'
---

import Image from '@theme/IdealImage';
import endpoints_testquery from '@site/static/images/cloud/sqlconsole/endpoints-testquery.png';
import endpoints_savequery from '@site/static/images/cloud/sqlconsole/endpoints-savequery.png';
import endpoints_configure from '@site/static/images/cloud/sqlconsole/endpoints-configure.png';
import endpoints_completed from '@site/static/images/cloud/sqlconsole/endpoints-completed.png';
import endpoints_curltest from '@site/static/images/cloud/sqlconsole/endpoints-curltest.png';
import endpoints_monitoring from '@site/static/images/cloud/sqlconsole/endpoints-monitoring.png';



# クエリAPIエンドポイント

**クエリAPIエンドポイント** 機能を使用すると、ClickHouse Cloudコンソールの任意の保存されたSQLクエリから直接APIエンドポイントを作成できます。ネイティブドライバーを介してClickHouse Cloudサービスに接続することなく、HTTP経由でAPIエンドポイントにアクセスして保存されたクエリを実行できます。

## クイックスタートガイド {#quick-start-guide}

先に進む前に、APIキーと管理コンソールロールを持っていることを確認してください。このガイドに従って、[APIキーを作成](/cloud/manage/openapi)できます。

### 保存されたクエリの作成 {#creating-a-saved-query}

保存されたクエリがある場合は、このステップをスキップできます。

新しいクエリタブを開きます。デモ目的で、約45億件のレコードを含む[youtubeデータセット](/getting-started/example-datasets/youtube-dislikes)を使用します。例として、ユーザーが入力した`year`パラメータごとに、平均視聴回数が最も多い上位10人のアップローダーを返します：

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

このクエリにはパラメータ（`year`）が含まれています。SQLコンソールのクエリエディタは、ClickHouseクエリパラメータ式を自動的に検出し、各パラメータの入力を提供します。このクエリをすぐに実行して、動作することを確認しましょう：

<Image img={endpoints_testquery} size="md" alt="テスト例のクエリ" />

次のステップでは、クエリを保存します：

<Image img={endpoints_savequery} size="md" alt="例のクエリを保存" />

保存されたクエリに関するさらなる文書は[こちら](/cloud/get-started/sql-console#saving-a-query)で見ることができます。

### クエリAPIエンドポイントの構成 {#configuring-the-query-api-endpoint}

クエリAPIエンドポイントは、クエリビューから【共有】ボタンをクリックし、`APIエンドポイント`を選択することで構成できます。どのAPIキーがエンドポイントにアクセスできるか指定するよう求められます：

<Image img={endpoints_configure} size="md" alt="クエリエンドポイントを構成" />

APIキーを選択すると、クエリAPIエンドポイントが自動的にプロビジョニングされます。テストリクエストを送信するための`curl`コマンドの例が表示されます：

<Image img={endpoints_completed} size="md" alt="エンドポイントcurlコマンド" />

### クエリAPIパラメータ {#query-api-parameters}

クエリ内のクエリパラメータは、`{parameter_name: type}`という構文で指定できます。これらのパラメータは自動的に検出され、例のリクエストペイロードには、これらのパラメータを渡すための`queryVariables`オブジェクトが含まれます。

### テストと監視 {#testing-and-monitoring}

クエリAPIエンドポイントが作成されると、それが機能するかどうかを`curl`または他のHTTPクライアントを使用してテストできます：

<Image img={endpoints_curltest} size="md" alt="エンドポイントcurlテスト" />

最初のリクエストを送信した後、すぐに【共有】ボタンの右側に新しいボタンが表示されるはずです。それをクリックすると、クエリに関する監視データを含むフライアウトが開きます：

<Image img={endpoints_monitoring} size="md" alt="エンドポイント監視" />

## 実装の詳細 {#implementation-details}

### 説明 {#description}

このルートは指定されたクエリエンドポイントでクエリを実行します。さまざまなバージョン、形式、クエリ変数をサポートしています。レスポンスはストリーミングされる（_バージョン2のみ_）か、単一のペイロードとして返されます。

### 認証 {#authentication}

- **必要**: はい
- **方法**: OpenAPIキー/シークレットによる基本認証
- **権限**: クエリエンドポイントに必要な適切な権限。

### URLパラメータ {#url-parameters}

- `queryEndpointId`（必須）: 実行するクエリエンドポイントのユニークな識別子。

### クエリパラメータ {#query-parameters}

#### V1 {#v1}

なし

#### V2 {#v2}

- `format`（オプション）: レスポンスの形式。ClickHouseがサポートするすべての形式に対応。
- `param_:name` クエリで使用されるクエリ変数。`name`はクエリ内の変数名と一致する必要があります。これはリクエストのボディがストリームである場合のみに使用すべきです。
- `:clickhouse_setting` サポートされる[ClickHouse設定](/operations/settings/settings)がクエリパラメータとして渡すことができます。

### ヘッダー {#headers}

- `x-clickhouse-endpoint-version`（オプション）: クエリエンドポイントのバージョン。サポートされているバージョンは`1`と`2`です。提供されない場合、デフォルトのバージョンはエンドポイントに最後に保存されたものです。
- `x-clickhouse-endpoint-upgrade`（オプション）: このヘッダーを設定すると、エンドポイントのバージョンをアップグレードできます。これは`x-clickhouse-endpoint-version`ヘッダーと連携して機能します。

### リクエストボディ {#request-body}

- `queryVariables`（オプション）: クエリで使用される変数を含むオブジェクト。
- `format`（オプション）: レスポンスの形式。クエリAPIエンドポイントがバージョン2の場合、すべてのClickHouseがサポートする形式が可能です。v1のサポート形式は次のとおりです：
  - TabSeparated
  - TabSeparatedWithNames
  - TabSeparatedWithNamesAndTypes
  - JSON
  - JSONEachRow
  - CSV
  - CSVWithNames
  - CSVWithNamesAndTypes

### レスポンス {#responses}

- **200 OK**: クエリが正常に実行されました。
- **400 Bad Request**: リクエストが形式不正です。
- **401 Unauthorized**: 認証なしまたは不十分な権限でリクエストが行われました。
- **404 Not Found**: 指定されたクエリエンドポイントが見つかりませんでした。

### エラーハンドリング {#error-handling}

- リクエストに有効な認証資格情報が含まれていることを確認してください。
- `queryEndpointId`と`queryVariables`が正しいことを検証してください。
- サーバーエラーは優雅に処理し、適切なエラーメッセージを返してください。

### エンドポイントのバージョンアップグレード {#upgrading-the-endpoint-version}

エンドポイントのバージョンを`v1`から`v2`にアップグレードするには、リクエストに`x-clickhouse-endpoint-upgrade`ヘッダーを含めて`1`に設定します。これによりアップグレードプロセスが開始され、`v2`で利用可能な機能と改善を使用することができます。

## 例 {#examples}

### 基本リクエスト {#basic-request}

**クエリAPIエンドポイントSQL:**

```sql
SELECT database, name AS num_tables FROM system.tables LIMIT 3;
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

### クエリ変数とバージョン2を使用したJSONCompactEachRow形式のリクエスト {#request-with-query-variables-and-version-2-on-jsoncompacteachrow-format}

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

### テーブルにデータを挿入するクエリ変数内の配列を持つリクエスト {#request-with-array-in-the-query-variables-that-inserts-data-into-a-table}

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

### max_threadsを8に設定したClickHouse設定でのリクエスト {#request-with-clickhouse-settings-max_threads-set-to-8}

**クエリAPIエンドポイントSQL:**

```sql
SELECT * FROM system.tables;
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

### ストリームとしてレスポンスをリクエストして解析する {#request-and-parse-the-response-as-a-stream}

**クエリAPIエンドポイントSQL:**

```sql
SELECT name, database FROM system.tables;
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

**出力**

```shell
> npx tsx index.ts
> {"name":"COLUMNS","database":"INFORMATION_SCHEMA"}
> {"name":"KEY_COLUMN_USAGE","database":"INFORMATION_SCHEMA"}
...
> Stream ended.
```

### ファイルからテーブルにストリームを挿入する {#insert-a-stream-from-a-file-into-a-table}

ファイル `./samples/my_first_table_2024-07-11.csv` に以下の内容を作成します：

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
```
