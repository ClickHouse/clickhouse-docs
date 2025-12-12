---
sidebar_title: 'クエリ API エンドポイント'
slug: /cloud/get-started/query-endpoints
description: '保存したクエリから REST API エンドポイントを簡単に作成する'
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

# クエリ API エンドポイントのセットアップ {#setting-up-query-api-endpoints}

**Query API Endpoints** 機能を使用すると、ClickHouse Cloud コンソールで任意の保存済み SQL クエリから、直接 API エンドポイントを作成できます。ClickHouse Cloud サービスにネイティブ ドライバーで接続する必要なく、HTTP 経由で API エンドポイントにアクセスして保存済みクエリを実行できるようになります。

## 事前準備 {#quick-start-guide}

先に進む前に、次の準備ができていることを確認してください:

- 適切な権限を持つ API キー
- Admin Console ロール

まだ持っていない場合は、このガイドに従って [API キーを作成](/cloud/manage/openapi) できます。

:::note 最低限必要な権限
API エンドポイントに対してクエリを実行するには、API キーに `Member` 組織ロールと `Query Endpoints` サービスアクセスが必要です。データベースロールはエンドポイント作成時に設定されます。
:::

<VerticalStepper headerLevel="h3">

### 保存済みクエリを作成する {#creating-a-saved-query}

すでに保存済みクエリがある場合は、このステップをスキップできます。

新しいクエリタブを開きます。デモンストレーションのために、約 45 億件のレコードを含む [youtube データセット](/getting-started/example-datasets/youtube-dislikes) を使用します。
Cloud サービス上にテーブルを作成し、データを挿入するには、「[テーブルを作成](/getting-started/example-datasets/youtube-dislikes#create-the-table)」セクションの手順に従ってください。

:::tip 行数を `LIMIT` で制限する
このサンプルデータセットのチュートリアルでは大量のデータ (46.5 億行) を挿入するため、挿入に時間がかかる場合があります。
本ガイドの目的では、`LIMIT` 句を使用してより少量のデータを挿入することを推奨します。
例えば 1000 万行程度に制限してください。
:::

サンプルクエリとして、ユーザー入力の `year` パラメータを用いて、動画あたりの平均再生回数が多いアップローダー上位 10 件を返します。

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

このクエリには、上記のスニペットでハイライトされているパラメータ (`year`) が含まれている点に注意してください。
パラメータは、中括弧 `{ }` とパラメータの型を組み合わせて指定できます。
SQL コンソールのクエリエディタは ClickHouse のクエリパラメータ式を自動的に検出し、各パラメータに対応する入力欄を提供します。

クエリが動作することを確認するために、SQL エディタ右側のクエリ変数入力ボックスに `2010` 年を指定して、このクエリを実行してみましょう:

<Image img={endpoints_testquery} size="md" alt="サンプルクエリをテストする" />

次に、クエリを保存します:

<Image img={endpoints_savequery} size="md" alt="サンプルクエリを保存する" />

保存済みクエリに関する詳細なドキュメントは、「[クエリを保存する](/cloud/get-started/sql-console#saving-a-query)」セクションを参照してください。

### クエリ API エンドポイントの設定 {#configuring-the-query-api-endpoint}

クエリビューから直接、**Share** ボタンをクリックし、`API Endpoint` を選択することで Query API エンドポイントを設定できます。
どの API キーがこのエンドポイントへアクセスできるかを指定するよう促されます:

<Image img={endpoints_configure} size="md" alt="クエリエンドポイントの設定" />

API キーを選択した後、次の項目を指定します:
- クエリの実行に使用する Database ロール (`Full access`、`Read only`、または `Create a custom role`)
- クロスオリジンリソース共有 (CORS) で許可するドメイン

これらのオプションを選択すると、クエリ API エンドポイントが自動的にプロビジョニングされます。

テストリクエストを送信できるよう、`curl` コマンドの例が表示されます:

<Image img={endpoints_completed} size="md" alt="エンドポイント用 curl コマンド" />

利便性のため、インターフェイスに表示される curl コマンドを以下に示します:

```bash
curl -H "Content-Type: application/json" -s --user '<key_id>:<key_secret>' '<API-endpoint>?format=JSONEachRow&param_year=<value>'
```

### Query API パラメータ {#query-api-parameters}

クエリ内のクエリパラメータは `{parameter_name: type}` という構文で指定できます。これらのパラメータは自動的に検出され、サンプルリクエストのペイロードには、これらのパラメータを渡すための `queryVariables` オブジェクトが含まれます。

### テストとモニタリング {#testing-and-monitoring}

Query API エンドポイントを作成したら、`curl` やその他の HTTP クライアントを使用して動作をテストできます:

<Image img={endpoints_curltest} size="md" alt="エンドポイントの curl テスト" />

最初のリクエストを送信すると、**Share** ボタンのすぐ右側に新しいボタンが表示されます。これをクリックすると、そのクエリに関するモニタリングデータを含むフライアウトが開きます:

<Image img={endpoints_monitoring} size="sm" alt="エンドポイントのモニタリング" />

</VerticalStepper>

## 実装の詳細 {#implementation-details}

このエンドポイントは、保存済みの Query API エンドポイントに対してクエリを実行します。
複数バージョンへの対応、柔軟なレスポンス形式、パラメータ付きクエリ、およびオプションのストリーミングレスポンス（バージョン 2 のみ）をサポートします。

**エンドポイント:**

```text
GET /query-endpoints/{queryEndpointId}/run
POST /query-endpoints/{queryEndpointId}/run
```

### HTTP メソッド {#http-methods}

| メソッド | ユースケース | パラメータ |
|---------|----------|------------|
| **GET** | パラメータ付きのシンプルなクエリ | クエリ変数を URL パラメータ（`?param_name=value`）として渡す |
| **POST** | 複雑なクエリ、またはリクエストボディを使用する場合 | クエリ変数をリクエストボディ内の `queryVariables` オブジェクトとして渡す |

**GET を使用する場合:**

- 入れ子構造の複雑なデータを伴わないシンプルなクエリ
- パラメータを容易に URL エンコードできる場合
- HTTP GET のセマンティクスによるキャッシュの利点を得たい場合

**POST を使用する場合:**

- 配列、オブジェクト、大きな文字列などの複雑なクエリ変数がある場合
- セキュリティ／プライバシー上、リクエストボディで送信することが望ましい場合
- ストリーミングによるファイルアップロードや大容量データを送信する場合

### 認証 {#authentication}

**必須:** はい  
**方式:** OpenAPI キー／シークレットを使用した Basic 認証  
**権限:** クエリエンドポイントに対して適切な権限

### リクエスト設定 {#request-configuration}

#### URL パラメータ {#url-params}

| パラメータ | 必須 | 説明 |
|-----------|----------|-------------|
| `queryEndpointId` | **はい** | 実行するクエリエンドポイントの一意の識別子 |

#### クエリパラメータ {#query-params}

| Parameter | Required | Description | Example |
|-----------|----------|-------------|---------|
| `format` | No | レスポンス形式（すべての ClickHouse フォーマットに対応） | `?format=JSONEachRow` |
| `param_:name` | No | リクエストボディがストリームの場合に使用するクエリ変数。`:name` を変数名に置き換えます | `?param_year=2024` |
| `request_timeout` | No | クエリのタイムアウト（ミリ秒単位、デフォルト: 30000） | `?request_timeout=60000` |
| `:clickhouse_setting` | No | サポートされている任意の [ClickHouse 設定](https://clickhouse.com/docs/operations/settings/settings) | `?max_threads=8` |

#### ヘッダー {#headers}

| ヘッダー | 必須 | 説明 | 値 |
|--------|----------|-------------|--------|
| `x-clickhouse-endpoint-version` | いいえ | エンドポイントのバージョンを指定します | `1` または `2`（省略時は最後に保存されたバージョン） |
| `x-clickhouse-endpoint-upgrade` | いいえ | エンドポイントのバージョンをアップグレードします（version ヘッダーと併用） | アップグレードする場合は `1` |

---

### リクエストボディ {#request-body}

#### パラメーター {#params}

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `queryVariables` | object | No | クエリで使用する変数 |
| `format` | string | No | レスポンス形式 |

#### サポートされるフォーマット {#supported-formats}

| バージョン             | サポートされるフォーマット                                                                                                                                      |
|-------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **バージョン 2**        | ClickHouse がサポートするすべてのフォーマット                                                                                                                 |
| **バージョン 1（制限付き）** | TabSeparated <br/> TabSeparatedWithNames <br/> TabSeparatedWithNamesAndTypes <br/> JSON <br/> JSONEachRow <br/> CSV <br/> CSVWithNames <br/> CSVWithNamesAndTypes |

---

### レスポンス {#responses}

#### 成功 {#success}

**ステータス:** `200 OK`  
クエリは正常に実行されました。

#### エラーコード {#error-codes}

| ステータスコード | 説明 |
|-------------|-------------|
| `400 Bad Request` | リクエストの形式が正しくありません |
| `401 Unauthorized` | 認証情報がないか、権限が不足しています |
| `404 Not Found` | 指定されたクエリエンドポイントが見つかりませんでした |

#### エラー処理のベストプラクティス {#error-handling-best-practices}

- リクエストに有効な認証情報が含まれていることを確認する
- 送信前に `queryEndpointId` と `queryVariables` を検証する
- 適切なエラーメッセージを伴う、堅牢なエラー処理を実装する

---

### エンドポイントバージョンのアップグレード {#upgrading-endpoint-versions}

バージョン 1 からバージョン 2 にアップグレードするには、次のようにします。

1. `x-clickhouse-endpoint-upgrade` ヘッダーを `1` に設定してリクエストに含める
2. `x-clickhouse-endpoint-version` ヘッダーを `2` に設定してリクエストに含める

これにより、バージョン 2 で提供される次の機能を利用できるようになります。

- すべての ClickHouse フォーマットのサポート
- レスポンスのストリーミング機能
- パフォーマンスおよび機能の強化

## 例 {#examples}

### 基本的なリクエスト {#basic-request}

**クエリ API エンドポイント用の SQL:**

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

```json title="Response"
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
      "x-clickhouse-endpoint-version": "2",
    },
  }
)
  .then((response) => response.json())
  .then((data) => console.log(data))
  .catch((error) => console.error("Error:", error));
```

```application/x-ndjson title="レスポンス"
{"database":"INFORMATION_SCHEMA","num_tables":"COLUMNS"}
{"database":"INFORMATION_SCHEMA","num_tables":"KEY_COLUMN_USAGE"}
{"database":"INFORMATION_SCHEMA","num_tables":"REFERENTIAL_CONSTRAINTS"}
```
</TabItem>
</Tabs>

### Request with query variables and version 2 on JSONCompactEachRow format {#request-with-query-variables-and-version-2-on-jsoncompacteachrow-format}

**Query API Endpoint SQL:**

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

```application/x-ndjson title="レスポンス"
    ["query_cache", "system"]
    ["query_log", "system"]
    ["query_views_log", "system"]
    ```
</TabItem>
</Tabs>

### Request with array in the query variables that inserts data into a table {#request-with-array-in-the-query-variables-that-inserts-data-into-a-table}

**Table SQL:**

```SQL
CREATE TABLE default.t_arr
(
    `arr` Array(Array(Array(UInt32)))
)
ENGINE = MergeTree
ORDER BY tuple()
```

**Query API Endpoint SQL:**

```sql
INSERT INTO default.t_arr VALUES ({arr: Array(Array(Array(UInt32)))});
```

<Tabs>
<TabItem value="cURL" label="cURL" default>

```bash
    curl -X POST 'https://console-api.clickhouse.cloud/.api/query-endpoints/&lt;endpoint id&gt;/run' \
    --user '&lt;openApiKeyId:openApiKeySecret&gt;' \
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
      "https://console-api.clickhouse.cloud/.api/query-endpoints/&lt;endpoint id&gt;/run",
      {
        method: "POST",
        headers: {
          Authorization: "Basic &lt;base64_encoded_credentials&gt;",
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

```text title="レスポンス"
    OK
    ```

</TabItem>
</Tabs>

### Request with ClickHouse settings `max_threads` set to 8 {#request-with-clickhouse-settings-max_threads-set-to-8}

**Query API Endpoint SQL:**

```sql
SELECT * FROM system.tables;
```

<Tabs>
<TabItem value="GET" label="GET (cURL)" default>

```bash
    curl 'https://console-api.clickhouse.cloud/.api/query-endpoints/&lt;endpoint id&gt;/run?max_threads=8' \
    --user '&lt;openApiKeyId:openApiKeySecret&gt;' \
    -H 'x-clickhouse-endpoint-version: 2'
    ```

</TabItem>
<TabItem value="cURL" label="POST (cURL)">

```bash
    curl -X POST 'https://console-api.clickhouse.cloud/.api/query-endpoints/&lt;endpoint id&gt;/run?max_threads=8,' \
    --user '&lt;openApiKeyId:openApiKeySecret&gt;' \
    -H 'Content-Type: application/json' \
    -H 'x-clickhouse-endpoint-version: 2' \
    ```

</TabItem>
<TabItem value="JavaScript" label="JavaScript">

```javascript
    fetch(
      "https://console-api.clickhouse.cloud/.api/query-endpoints/&lt;endpoint id&gt;/run?max_threads=8",
      {
        method: "POST",
        headers: {
          Authorization: "Basic &lt;base64_encoded_credentials&gt;",
          "Content-Type": "application/json",
          "x-clickhouse-endpoint-version": "2",
        },
      }
    )
      .then((response) =&gt; response.json())
      .then((data) =&gt; console.log(data))
      .catch((error) =&gt; console.error("Error:", error));
    ```

</TabItem>
</Tabs>

### Request and parse the response as a stream` {#request-and-parse-the-response-as-a-stream}

**Query API Endpoint SQL:**

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
    // 使用例
    fetchAndLogChunks(endpointUrl, openApiKeyId, openApiKeySecret).catch((err) =>
      console.error(err)
    );
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

### Insert a stream from a file into a table {#insert-a-stream-from-a-file-into-a-table}

Create a file `./samples/my_first_table_2024-07-11.csv` with the following content:

```csv
"user_id","json","name"
"1","{""name"":""John"",""age"":30}","John"
"2","{""name"":""Jane"",""age"":25}","Jane"
```

**Create Table SQL:**

```sql
create table default.my_first_table
(
    user_id String,
    json String,
    name String,
) ENGINE = MergeTree()
ORDER BY user_id;
```

**Query API Endpoint SQL:**

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
