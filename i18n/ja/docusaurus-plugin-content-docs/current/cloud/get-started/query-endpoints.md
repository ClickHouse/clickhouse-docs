---
sidebar_title: クエリ API エンドポイント
slug: /cloud/get-started/query-endpoints
description: 保存したクエリから簡単に REST API エンドポイントを立ち上げる
keywords: [api, クエリ api エンドポイント, クエリエンドポイント, クエリ rest api]
---

# クエリ API エンドポイント

**クエリ API エンドポイント** 機能では、ClickHouse Cloud コンソールで保存された SQL クエリから直接 API エンドポイントを作成することができます。ネイティブドライバーを介して ClickHouse Cloud サービスに接続することなく、HTTP を介して保存されたクエリを実行するために API エンドポイントにアクセスできます。

## クイックスタートガイド {#quick-start-guide}

続行する前に、API キーと管理コンソールロールを持っていることを確認してください。このガイドに従って、[API キーを作成](/cloud/manage/openapi)できます。

### 保存されたクエリの作成 {#creating-a-saved-query}

保存されたクエリがある場合は、このステップをスキップできます。

新しいクエリタブを開きます。デモ用として、約 45 億レコードを含む [youtube データセット](/getting-started/example-datasets/youtube-dislikes) を使用します。例として、ユーザーが入力した `year` パラメータにより、ビデオあたりの平均視聴回数で上位 10 のアップローダーを返します：

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

このクエリにはパラメータ（`year`）が含まれていることに注意してください。SQL コンソールのクエリエディタは自動的に ClickHouse クエリパラメータ式を検出し、各パラメータの入力を提供します。このクエリが機能することを確認するために、クイックに実行してみましょう：

![テスト例のクエリ](@site/i18n/ja/docusaurus-plugin-content-docs/current/cloud/images/sqlconsole/endpoints-testquery.png)

次のステップとして、クエリを保存します：

![例のクエリを保存](@site/i18n/ja/docusaurus-plugin-content-docs/current/cloud/images/sqlconsole/endpoints-savequery.png)

保存されたクエリに関する詳細なドキュメントは、[こちら](/cloud/get-started/sql-console#saving-a-query)で見つけることができます。

### クエリ API エンドポイントの構成 {#configuring-the-query-api-endpoint}

クエリ API エンドポイントは、クエリビューから **共有** ボタンをクリックし、`API エンドポイント` を選択することで直接構成できます。どの API キーがエンドポイントにアクセスできるか指定するように求められます：

![クエリエンドポイントの構成](@site/i18n/ja/docusaurus-plugin-content-docs/current/cloud/images/sqlconsole/endpoints-configure.png)

API キーを選択すると、クエリ API エンドポイントが自動的にプロビジョニングされます。テストリクエストを送信できるように、例の `curl` コマンドが表示されます：

![エンドポイント curl コマンド](@site/i18n/ja/docusaurus-plugin-content-docs/current/cloud/images/sqlconsole/endpoints-completed.png)

### クエリ API パラメータ {#query-api-parameters}

クエリ内のクエリパラメータは、`{parameter_name: type}` の構文で指定できます。これらのパラメータは自動的に検出され、例のリクエストペイロードには、これらのパラメータを渡すための `queryVariables` オブジェクトが含まれます。

### テストとモニタリング {#testing-and-monitoring}

クエリ API エンドポイントが作成されると、`curl` または他の HTTP クライアントを使用して動作をテストできます：
<img src={require('@site/i18n/ja/docusaurus-plugin-content-docs/current/cloud/images/sqlconsole/endpoints-curltest.png').default} class="image" alt="エンドポイント curl テスト" style={{width: '80%', background:'none'}} />

最初のリクエストを送信した後、**共有** ボタンのすぐ右に新しいボタンが表示されるはずです。それをクリックすると、クエリに関するモニタリングデータを含むフライアウトが開きます：

![エンドポイントモニタリング](@site/i18n/ja/docusaurus-plugin-content-docs/current/cloud/images/sqlconsole/endpoints-monitoring.png)

## 実装の詳細 {#implementation-details}

### 説明 {#description}

このルートは、指定されたクエリエンドポイントでクエリを実行します。異なるバージョン、フォーマット、およびクエリ変数をサポートしています。レスポンスはストリーム（_バージョン 2 のみ_）または単一のペイロードとして返されます。

### 認証 {#authentication}

- **必要**：はい
- **方法**：OpenAPI キー/秘密による基本認証
- **権限**：クエリエンドポイントに対する適切な権限。

### URL パラメータ {#url-parameters}

- `queryEndpointId`（必須）：実行するクエリエンドポイントの一意の識別子。

### クエリパラメータ {#query-parameters}

#### V1 {#v1}

なし

#### V2 {#v2}

- `format`（オプション）：レスポンスのフォーマット。ClickHouse がサポートするすべてのフォーマットをサポート。
- `param_:name` クエリ変数をクエリで使用します。`name` はクエリ内の変数名と一致する必要があります。これはリクエストのボディがストリームの場合にのみ使用する必要があります。
- `:clickhouse_setting` サポートされている任意の [ClickHouse 設定](/operations/settings/settings) をクエリパラメータとして渡すことができます。

### ヘッダー {#headers}

- `x-clickhouse-endpoint-version`（オプション）：クエリエンドポイントのバージョン。サポートされているバージョンは `1` と `2` です。提供されない場合は、エンドポイントの最後に保存されたバージョンがデフォルトとなります。
- `x-clickhouse-endpoint-upgrade`（オプション）：このヘッダーを設定してエンドポイントバージョンをアップグレードします。これは `x-clickhouse-endpoint-version` ヘッダーと共に機能します。

### リクエストボディ {#request-body}

- `queryVariables`（オプション）：クエリで使用される変数を含むオブジェクト。
- `format`（オプション）：レスポンスのフォーマット。クエリ API エンドポイントがバージョン 2 の場合、ClickHouse がサポートする任意のフォーマットが可能です。v1 のサポートされているフォーマットは以下の通りです：
  - TabSeparated
  - TabSeparatedWithNames
  - TabSeparatedWithNamesAndTypes
  - JSON
  - JSONEachRow
  - CSV
  - CSVWithNames
  - CSVWithNamesAndTypes

### レスポンス {#responses}

- **200 OK**：クエリが正常に実行されました。
- **400 Bad Request**：リクエストが不正形でした。
- **401 Unauthorized**：認証なしまたは不十分な権限でリクエストが行われました。
- **404 Not Found**：指定されたクエリエンドポイントが見つかりませんでした。

### エラーハンドリング {#error-handling}

- リクエストに有効な認証情報が含まれていることを確認してください。
- `queryEndpointId` と `queryVariables` が正しいことを検証してください。
- サーバーエラーを適切に処理し、適切なエラーメッセージを返します。

### エンドポイントバージョンのアップグレード {#upgrading-the-endpoint-version}

エンドポイントのバージョンを `v1` から `v2` にアップグレードするには、リクエストに `x-clickhouse-endpoint-upgrade` ヘッダーを含め、それを `1` に設定します。これによりアップグレードプロセスがトリガーされ、`v2` で利用可能な機能と改善を使用できます。

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

### クエリ変数を使用し、JSONCompactEachRow フォーマットでバージョン 2 のリクエスト {#request-with-query-variables-and-version-2-on-jsoncompacteachrow-format}

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

### クエリ変数に Array を持つリクエストで、テーブルにデータを挿入 {#request-with-array-in-the-query-variables-that-inserts-data-into-a-table}

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

### ClickHouse 設定 max_threads を 8 に設定したリクエスト {#request-with-clickhouse-settings-max_threads-set-to-8}

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

### ストリームとしてリクエストし、レスポンスをパースする {#request-and-parse-the-response-as-a-stream}

**クエリ API エンドポイント SQL:**

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

次の内容でファイル ./samples/my_first_table_2024-07-11.csv を作成します：

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
