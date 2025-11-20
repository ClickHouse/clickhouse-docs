---
sidebar_title: 'クエリ API エンドポイント'
slug: /cloud/get-started/query-endpoints
description: '保存済みクエリから REST API エンドポイントを簡単に作成'
keywords: ['api', 'query api endpoints', 'query endpoints', 'query rest api']
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


# クエリ API エンドポイントの設定

**Query API Endpoints** 機能を使用すると、ClickHouse Cloud コンソールで保存した任意の SQL クエリから、直接 API エンドポイントを作成できます。HTTP 経由で API エンドポイントにアクセスして保存済みクエリを実行できるため、ネイティブドライバーを使って ClickHouse Cloud サービスに接続する必要がなくなります。



## 前提条件 {#quick-start-guide}

作業を進める前に、以下をご確認ください：

- 適切な権限を持つAPIキー
- Admin Consoleロール

APIキーをまだお持ちでない場合は、[APIキーの作成](/cloud/manage/openapi)ガイドに従って作成してください。

:::note 最小限の権限
APIエンドポイントにクエリを実行するには、APIキーに`Member`組織ロールと`Query Endpoints`サービスアクセスが必要です。データベースロールはエンドポイント作成時に設定されます。
:::

<VerticalStepper headerLevel="h3">

### 保存済みクエリの作成 {#creating-a-saved-query}

保存済みクエリをお持ちの場合は、このステップをスキップできます。

新しいクエリタブを開きます。デモンストレーションのため、約45億レコードを含む[youtubeデータセット](/getting-started/example-datasets/youtube-dislikes)を使用します。
Cloudサービス上でテーブルを作成しデータを挿入するには、["Create table"](/getting-started/example-datasets/youtube-dislikes#create-the-table)セクションの手順に従ってください。

:::tip 行数の`LIMIT`指定
サンプルデータセットのチュートリアルでは大量のデータ（46.5億行）を挿入するため、挿入に時間がかかる場合があります。
このガイドでは、`LIMIT`句を使用してより少量のデータ（例：1000万行）を挿入することを推奨します。
:::

サンプルクエリとして、ユーザーが入力した`year`パラメータにおいて、動画あたりの平均視聴回数が多い上位10名のアップローダーを返します。

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

このクエリには、上記のスニペットでハイライトされているパラメータ（`year`）が含まれていることに注意してください。
クエリパラメータは、波括弧`{ }`とパラメータの型を組み合わせて指定できます。
SQLコンソールクエリエディタは、ClickHouseクエリパラメータ式を自動的に検出し、各パラメータの入力欄を提供します。

SQLエディタの右側にあるクエリ変数入力ボックスで年`2010`を指定して、このクエリが正常に動作することを確認しましょう：

<Image img={endpoints_testquery} size='md' alt='Test the example query' />

次に、クエリを保存します：

<Image img={endpoints_savequery} size='md' alt='Save example query' />

保存済みクエリに関する詳細なドキュメントは、["Saving a query"](/cloud/get-started/sql-console#saving-a-query)セクションをご覧ください。

### クエリAPIエンドポイントの設定 {#configuring-the-query-api-endpoint}

クエリAPIエンドポイントは、クエリビューから直接設定できます。**Share**ボタンをクリックし、`API Endpoint`を選択してください。
エンドポイントにアクセスできるAPIキーを指定するよう求められます：

<Image img={endpoints_configure} size='md' alt='Configure query endpoint' />

APIキーを選択した後、以下の設定を求められます：

- クエリ実行に使用するデータベースロールの選択（`Full access`、`Read only`、または`Create a custom role`）
- クロスオリジンリソース共有（CORS）の許可ドメインの指定

これらのオプションを選択すると、クエリAPIエンドポイントが自動的にプロビジョニングされます。

テストリクエストを送信できるように、サンプルの`curl`コマンドが表示されます：

<Image img={endpoints_completed} size='md' alt='Endpoint curl command' />

インターフェースに表示されるcurlコマンドを以下に示します：

```bash
curl -H "Content-Type: application/json" -s --user '<key_id>:<key_secret>' '<API-endpoint>?format=JSONEachRow&param_year=<value>'
```

### クエリAPIパラメータ {#query-api-parameters}

クエリ内のクエリパラメータは、`{parameter_name: type}`という構文で指定できます。これらのパラメータは自動的に検出され、サンプルリクエストペイロードには、これらのパラメータを渡すための`queryVariables`オブジェクトが含まれます。

### テストとモニタリング {#testing-and-monitoring}

クエリAPIエンドポイントが作成されたら、`curl`または他のHTTPクライアントを使用して動作をテストできます：

<Image img={endpoints_curltest} size='md' alt='endpoint curl test' />

最初のリクエストを送信すると、**Share**ボタンのすぐ右側に新しいボタンが表示されます。これをクリックすると、クエリに関するモニタリングデータを含むフライアウトが開きます：

<Image img={endpoints_monitoring} size='sm' alt='Endpoint monitoring' />

</VerticalStepper>


## 実装の詳細 {#implementation-details}

このエンドポイントは、保存されたQuery APIエンドポイントでクエリを実行します。
複数のバージョン、柔軟なレスポンス形式、パラメータ化されたクエリ、およびオプションのストリーミングレスポンス(バージョン2のみ)をサポートしています。

**エンドポイント:**

```text
GET /query-endpoints/{queryEndpointId}/run
POST /query-endpoints/{queryEndpointId}/run
```

### HTTPメソッド {#http-methods}

| メソッド   | ユースケース                                   | パラメータ                                                     |
| -------- | ------------------------------------------ | -------------------------------------------------------------- |
| **GET**  | パラメータを含むシンプルなクエリ             | URLパラメータでクエリ変数を渡す(`?param_name=value`)  |
| **POST** | 複雑なクエリまたはリクエストボディを使用する場合 | リクエストボディでクエリ変数を渡す(`queryVariables`オブジェクト) |

**GETを使用する場合:**

- 複雑なネストされたデータを含まないシンプルなクエリ
- パラメータを簡単にURLエンコードできる
- HTTP GETセマンティクスによるキャッシングの利点

**POSTを使用する場合:**

- 複雑なクエリ変数(配列、オブジェクト、大きな文字列)
- セキュリティやプライバシーのためにリクエストボディが望ましい
- ストリーミングファイルアップロードまたは大量データ

### 認証 {#authentication}

**必須:** はい  
**方法:** OpenAPI Key/Secretを使用したBasic認証  
**権限:** クエリエンドポイントに対する適切な権限

### リクエスト設定 {#request-configuration}

#### URLパラメータ {#url-params}

| パラメータ         | 必須 | 説明                                        |
| ----------------- | -------- | -------------------------------------------------- |
| `queryEndpointId` | **はい**  | 実行するクエリエンドポイントの一意の識別子 |

#### クエリパラメータ {#query-params}

| パラメータ             | 必須 | 説明                                                                                  | 例               |
| --------------------- | -------- | -------------------------------------------------------------------------------------------- | --------------------- |
| `format`              | いいえ       | レスポンス形式(すべてのClickHouse形式をサポート)                                            | `?format=JSONEachRow` |
| `param_:name`         | いいえ       | リクエストボディがストリームの場合のクエリ変数。`:name`を変数名に置き換える       | `?param_year=2024`    |
| `:clickhouse_setting` | いいえ       | サポートされている任意の[ClickHouse設定](https://clickhouse.com/docs/operations/settings/settings) | `?max_threads=8`      |

#### ヘッダー {#headers}

| ヘッダー                          | 必須 | 説明                                                 | 値                                      |
| ------------------------------- | -------- | ----------------------------------------------------------- | ------------------------------------------- |
| `x-clickhouse-endpoint-version` | いいえ       | エンドポイントのバージョンを指定                              | `1`または`2`(デフォルトは最後に保存されたバージョン) |
| `x-clickhouse-endpoint-upgrade` | いいえ       | エンドポイントバージョンのアップグレードをトリガー(バージョンヘッダーと併用) | アップグレードする場合は`1`                              |

---

### リクエストボディ {#request-body}

#### パラメータ {#params}

| パラメータ        | 型   | 必須 | 説明                       |
| ---------------- | ------ | -------- | --------------------------------- |
| `queryVariables` | object | いいえ       | クエリで使用する変数 |
| `format`         | string | いいえ       | レスポンス形式                   |

#### サポートされている形式 {#supported-formats}

| バージョン                 | サポートされている形式                                                                                                                                                 |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **バージョン2**           | ClickHouseがサポートするすべての形式                                                                                                                                  |
| **バージョン1(制限あり)** | TabSeparated <br/> TabSeparatedWithNames <br/> TabSeparatedWithNamesAndTypes <br/> JSON <br/> JSONEachRow <br/> CSV <br/> CSVWithNames <br/> CSVWithNamesAndTypes |

---

### レスポンス {#responses}

#### 成功 {#success}

**ステータス:** `200 OK`  
クエリが正常に実行されました。

#### エラーコード {#error-codes}

| ステータスコード        | 説明                                        |
| ------------------ | -------------------------------------------------- |
| `400 Bad Request`  | リクエストの形式が不正です                          |
| `401 Unauthorized` | 認証が欠落しているか、権限が不足しています |
| `404 Not Found`    | 指定されたクエリエンドポイントが見つかりませんでした         |

#### エラー処理のベストプラクティス {#error-handling-best-practices}

- リクエストに有効な認証情報が含まれていることを確認する
- 送信前に`queryEndpointId`と`queryVariables`を検証する
- 適切なエラーメッセージを含むエラー処理を実装する

---

### エンドポイントバージョンのアップグレード {#upgrading-endpoint-versions}

バージョン1からバージョン2にアップグレードするには:

1. `x-clickhouse-endpoint-upgrade`ヘッダーを`1`に設定して含める
2. `x-clickhouse-endpoint-version`ヘッダーを`2`に設定して含める

これにより、以下を含むバージョン2の機能にアクセスできるようになります:

- すべてのClickHouse形式のサポート
- レスポンスストリーミング機能
- パフォーマンスと機能の強化


## 例 {#examples}

### 基本的なリクエスト {#basic-request}

**Query API エンドポイント SQL:**

```sql
SELECT database, name AS num_tables FROM system.tables LIMIT 3;
```

#### バージョン 1 {#version-1}

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

#### バージョン 2 {#version-2}

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

### クエリ変数とバージョン 2 を使用した JSONCompactEachRow 形式のリクエスト {#request-with-query-variables-and-version-2-on-jsoncompacteachrow-format}

**Query API エンドポイント SQL:**

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
  .catch((error) => console.error("エラー:", error))
```

</TabItem>
</Tabs>

### レスポンスをストリームとしてリクエストし、解析する` {#request-and-parse-the-response-as-a-stream}

**Query API エンドポイント用 SQL:**

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
    console.log("ストリームが終了しました。")
  })

  reader.on("error", (err) => {
    console.error("ストリーム エラー:", err)
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
> ストリームが終了しました。
```

</TabItem>
</Tabs>

### ファイルからテーブルにストリームを挿入する {#insert-a-stream-from-a-file-into-a-table}

次の内容を持つファイル `./samples/my_first_table_2024-07-11.csv` を作成します:

```csv
"user_id","json","name"
"1","{""name"":""John"",""age"":30}","John"
"2","{""name"":""Jane"",""age"":25}","Jane"
```

**テーブル作成用 SQL:**

```sql
create table default.my_first_table
(
    user_id String,
    json String,
    name String,
) ENGINE = MergeTree()
ORDER BY user_id;
```

**Query API エンドポイント用 SQL:**

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
