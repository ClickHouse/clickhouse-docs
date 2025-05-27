---
'sidebar_title': 'Query API Endpoints'
'slug': '/cloud/get-started/query-endpoints'
'description': '保存したクエリから簡単に REST API エンドポイントを作成します'
'keywords':
- 'api'
- 'query api endpoints'
- 'query endpoints'
- 'query rest api'
'title': 'クエリ API エンドポイント'
---

import Image from '@theme/IdealImage';
import endpoints_testquery from '@site/static/images/cloud/sqlconsole/endpoints-testquery.png';
import endpoints_savequery from '@site/static/images/cloud/sqlconsole/endpoints-savequery.png';
import endpoints_configure from '@site/static/images/cloud/sqlconsole/endpoints-configure.png';
import endpoints_completed from '@site/static/images/cloud/sqlconsole/endpoints-completed.png';
import endpoints_curltest from '@site/static/images/cloud/sqlconsole/endpoints-curltest.png';
import endpoints_monitoring from '@site/static/images/cloud/sqlconsole/endpoints-monitoring.png';


# クエリ API エンドポイント

**クエリ API エンドポイント** 機能を使用すると、ClickHouse Cloud コンソール内の任意の保存された SQL クエリから直接 API エンドポイントを作成できます。この機能により、ネイティブ ドライバーを介して ClickHouse Cloud サービスに接続することなく、HTTP を介して API エンドポイントにアクセスして保存したクエリを実行できます。

## クイック スタート ガイド {#quick-start-guide}

続行する前に、API キーと Admin Console Role を持っていることを確認してください。このガイドに従って [API キーを作成する](/cloud/manage/openapi) ことができます。

### 保存されたクエリの作成 {#creating-a-saved-query}

保存されたクエリがある場合は、このステップをスキップできます。

新しいクエリ タブを開きます。デモンストレーション用に、約 45 億件のレコードを含む [youtube データセット](/getting-started/example-datasets/youtube-dislikes) を使用します。例として、ユーザーが入力した `year` パラメータに基づいて、平均ビュー数による上位 10 人のアップローダーを返します:

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

このクエリにはパラメータ (`year`) が含まれていることに注意してください。SQL コンソール クエリ エディタは、ClickHouse のクエリ パラメータ式を自動的に検出し、各パラメータの入力を提供します。このクエリが正常に機能するかどうかを確認するために、すぐに実行してみましょう:

<Image img={endpoints_testquery} size="md" alt="例のクエリをテスト" />

次のステップとして、クエリを保存します:

<Image img={endpoints_savequery} size="md" alt="例のクエリを保存" />

保存されたクエリに関する詳細なドキュメントは [こちら](/cloud/get-started/sql-console#saving-a-query) で確認できます。

### クエリ API エンドポイントの構成 {#configuring-the-query-api-endpoint}

クエリ API エンドポイントは、クエリビューから **Share** ボタンをクリックし、 `API Endpoint` を選択することで構成できます。どの API キーがエンドポイントにアクセスできるかを指定するよう促されます:

<Image img={endpoints_configure} size="md" alt="クエリエンドポイントを構成" />

API キーを選択すると、クエリ API エンドポイントが自動的にプロビジョニングされます。テスト リクエストを送信するための例の `curl` コマンドが表示されます:

<Image img={endpoints_completed} size="md" alt="エンドポイント curl コマンド" />

### クエリ API パラメータ {#query-api-parameters}

クエリ内のクエリ パラメータは、 `{parameter_name: type}` という構文で指定できます。これらのパラメータは自動的に検出され、例のリクエスト ペイロードにはこれらのパラメータを渡すための `queryVariables` オブジェクトが含まれます。

### テストと監視 {#testing-and-monitoring}

クエリ API エンドポイントが作成されると、 `curl` またはその他の HTTP クライアントを使用して正常に機能するかをテストできます:

<Image img={endpoints_curltest} size="md" alt="エンドポイント curl テスト" />

最初のリクエストを送信すると、**Share** ボタンのすぐ右に新しいボタンが表示されます。それをクリックすると、クエリに関する監視データを含むフライアウトが開きます:

<Image img={endpoints_monitoring} size="md" alt="エンドポイントの監視" />

## 実装の詳細 {#implementation-details}

### 説明 {#description}

このルートは、指定されたクエリ エンドポイントでクエリを実行します。異なるバージョン、形式、およびクエリ変数をサポートしています。レスポンスはストリーム (_バージョン 2 のみ_) で返すことも、単一のペイロードとして返すこともできます。

### 認証 {#authentication}

- **必須**: はい
- **方法**: OpenAPI キー/シークレットを介した基本認証
- **権限**: クエリ エンドポイントに対する適切な権限。

### URL パラメータ {#url-parameters}

- `queryEndpointId` (必須): 実行するクエリ エンドポイントの一意の識別子。

### クエリ パラメータ {#query-parameters}

#### V1 {#v1}

なし

#### V2 {#v2}

- `format` (オプション): レスポンスの形式。ClickHouse がサポートするすべての形式をサポート。
- `param_:name` クエリで使用するクエリ変数。 `name` はクエリ内の変数名と一致する必要があります。リクエストの本文がストリームである場合にのみ使用する必要があります。
- `:clickhouse_setting` サポートされている [ClickHouse 設定](/operations/settings/settings) をクエリパラメータとして渡すことができます。

### ヘッダー {#headers}

- `x-clickhouse-endpoint-version` (オプション): クエリ エンドポイントのバージョン。サポートされているバージョンは `1` と `2` です。指定しない場合、デフォルトバージョンはエンドポイントに最後に保存されたものです。
- `x-clickhouse-endpoint-upgrade` (オプション): このヘッダーを設定してエンドポイント バージョンをアップグレードします。これは、 `x-clickhouse-endpoint-version` ヘッダーと組み合わせて機能します。

### リクエスト ボディ {#request-body}

- `queryVariables` (オプション): クエリで使用する変数を含むオブジェクト。
- `format` (オプション): レスポンスの形式。クエリ API エンドポイントがバージョン 2 の場合、任意の ClickHouse によってサポートされている形式が可能です。v1 にサポートされる形式は次のとおりです:
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
- **400 Bad Request**: リクエストが不正です。
- **401 Unauthorized**: 認証なしまたは権限が不十分な状態でリクエストが行われました。
- **404 Not Found**: 指定されたクエリ エンドポイントが見つかりませんでした。

### エラーハンドリング {#error-handling}

- リクエストに有効な認証情報が含まれていることを確認します。
- `queryEndpointId` と `queryVariables` が正しいことを検証します。
- サーバーエラーを適切に処理し、適切なエラーメッセージを返します。

### エンドポイント バージョンのアップグレード {#upgrading-the-endpoint-version}

エンドポイント バージョンを `v1` から `v2` にアップグレードするには、リクエストに `x-clickhouse-endpoint-upgrade` ヘッダーを含め、その値を `1` に設定します。これによりアップグレードプロセスがトリガーされ、`v2` で利用可能な機能や改善点を使用できるようになります。

## 例 {#examples}

### 基本リクエスト {#basic-request}

**クエリ API エンドポイント SQL:**

```sql
SELECT database, name as num_tables FROM system.tables limit 3;
```

#### バージョン 1 {#version-1}

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

#### バージョン 2 {#version-2}

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

### クエリ変数と JSONCompactEachRow 形式のバージョン 2 でのリクエスト {#request-with-query-variables-and-version-2-on-jsoncompacteachrow-format}

**クエリ API エンドポイント SQL:**

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

### テーブルにデータを挿入するクエリ変数の配列を使ったリクエスト {#request-with-array-in-the-query-variables-that-inserts-data-into-a-table}

**テーブル SQL:**

```SQL
CREATE TABLE default.t_arr
(
    `arr` Array(Array(Array(UInt32)))
)
ENGINE = MergeTree
ORDER BY tuple()
```

**クエリ API エンドポイント SQL:**

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

### ClickHouse 設定 max_threads を 8 に設定するリクエスト {#request-with-clickhouse-settings-max_threads-set-to-8}

**クエリ API エンドポイント SQL:**

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

### ストリームとしてレスポンスをリクエストし、解析する {#request-and-parse-the-response-as-a-stream}

**クエリ API エンドポイント SQL:**

```sql
SELECT name, database from system.tables;
```

**TypeScript:**

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

### ファイルからテーブルにストリームを挿入する {#insert-a-stream-from-a-file-into-a-table}

次の内容を持つファイル ./samples/my_first_table_2024-07-11.csv を作成します:

```csv
"user_id","json","name"
"1","{""name"":""John"",""age"":30}","John"
"2","{""name"":""Jane"",""age"":25}","Jane"
```

**テーブル作成 SQL:**

```sql
create table default.my_first_table
(
    user_id String,
    json String,
    name String,
) ENGINE = MergeTree()
ORDER BY user_id;
```

**クエリ API エンドポイント SQL:**

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
